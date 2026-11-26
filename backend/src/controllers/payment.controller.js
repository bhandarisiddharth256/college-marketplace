import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Listing from "../models/Listing.model.js";
import Payment from "../models/Payment.model.js";
import Purchase from "../models/Purchase.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cleanupSoldListing from "../utils/cleanupSoldListing.js";

const isValidSignature = (orderId, paymentId, signature) => {
  if (
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string" ||
    !/^[a-f0-9]{64}$/i.test(signature)
  ) return false;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest();

  return crypto.timingSafeEqual(expected, Buffer.from(signature, "hex"));
};

/* Create an order using the server-side listing price. */
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { listingId } = req.body;

  if (!listingId) throw new ApiError(400, "Listing ID is required");

  const listing = await Listing.findOne({
    _id: listingId,
    isDeleted: false,
    status: "available",
    owner: { $ne: req.user._id },
  });

  if (!listing) throw new ApiError(404, "Listing not available");

  const amountInPaise = Math.round(listing.price * 100);
  if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) {
    throw new ApiError(400, "Invalid listing price");
  }

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `listing_${listing._id}_${Date.now()}`,
  });

  await Payment.create({
    user: req.user._id,
    listing: listing._id,
    amount: listing.price,
    currency: "INR",
    razorpayOrderId: order.id,
  });

  return res.status(201).json(
    new ApiResponse(201, order, "Payment order created")
  );
});

/* Verify the Razorpay signature and complete the purchase once. */
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = req.body;

  if (!isValidSignature(orderId, paymentId, signature)) {
    throw new ApiError(400, "Payment verification failed");
  }

  const payment = await Payment.findOne({
    razorpayOrderId: orderId,
    user: req.user._id,
  }).populate("listing");

  if (!payment) throw new ApiError(404, "Payment order not found");

  // A retry after a successful verification returns the original purchase.
  if (payment.status === "paid") {
    const purchase = await Purchase.findOne({
      listing: payment.listing._id,
      buyer: payment.user,
      status: "completed",
    });
    if (!purchase) throw new ApiError(409, "Purchase record needs reconciliation");

    return res.status(200).json(
      new ApiResponse(200, { payment, purchase }, "Payment already verified")
    );
  }

  if (payment.status !== "created") {
    throw new ApiError(409, "Payment is not eligible for verification");
  }

  const razorpayPayment = await razorpay.payments.fetch(paymentId);
  const expectedAmount = Math.round(payment.amount * 100);

  if (
    razorpayPayment.order_id !== orderId ||
    razorpayPayment.amount !== expectedAmount ||
    razorpayPayment.currency !== payment.currency ||
    razorpayPayment.status !== "captured"
  ) {
    throw new ApiError(400, "Payment details do not match this order");
  }

  const listing = payment.listing;
  if (!listing || listing.owner.equals(req.user._id)) {
    throw new ApiError(400, "Invalid listing purchase");
  }

  // This conditional write is the concurrency guard: only one buyer can win.
  const claimedListing = await Listing.findOneAndUpdate(
    {
      _id: listing._id,
      status: "available",
      isDeleted: false,
    },
    { $set: { status: "sold" } },
    { new: true }
  );

  if (!claimedListing) {
    throw new ApiError(409, "Listing is no longer available");
  }

  let purchase;
  try {
    [purchase] = await Purchase.create([{
      listing: claimedListing._id,
      buyer: payment.user,
      seller: claimedListing.owner,
      price: payment.amount,
    }]);

    const updatedPayment = await Payment.findOneAndUpdate(
      { _id: payment._id, status: "created" },
      {
        $set: {
          status: "paid",
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
        },
      },
      { new: true }
    );

    if (!updatedPayment) {
      throw new ApiError(409, "Payment was already processed");
    }

    payment.status = updatedPayment.status;
    payment.razorpayPaymentId = paymentId;
    payment.razorpaySignature = signature;
  } catch (error) {
    if (purchase) await Purchase.deleteOne({ _id: purchase._id });
    await Listing.updateOne(
      { _id: claimedListing._id, status: "sold" },
      { $set: { status: "available" } }
    );
    throw error;
  }

  await cleanupSoldListing(claimedListing._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      { payment, purchase },
      "Payment verified and purchase completed"
    )
  );
});
