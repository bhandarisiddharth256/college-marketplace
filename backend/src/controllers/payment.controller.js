import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Listing from "../models/Listing.model.js";
import Payment from "../models/Payment.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Purchase from "../models/Purchase.model.js";
import cleanupSoldListing from "../utils/cleanupSoldListing.js";

/* 💰 Create payment order */
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { listingId } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing || listing.status === "sold") {
    throw new ApiError(404, "Listing not available");
  }

  const order = await razorpay.orders.create({
    amount: listing.price, // paise
    currency: "INR",
  });

  await Payment.create({
    user: req.user._id,
    listing: listingId,
    amount: listing.price,
    razorpayOrderId: order.id,
  });

  return res.status(201).json(
    new ApiResponse(201, order, "Payment order created")
  );
});

/* ✅ Verify payment */
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Payment verification failed");
  }

  const payment = await Payment.findOne({
    razorpayOrderId: razorpay_order_id,
    status: "created",
  }).populate("listing");

  if (!payment) {
    throw new ApiError(404, "Payment record not found");
  }

  // Mark payment as paid
  payment.status = "paid";
  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  await payment.save();

  const listing = payment.listing;

  // Prevent double purchase
  if (listing.status === "sold") {
    throw new ApiError(400, "Listing already sold");
  }

  // Create purchase record
  const purchase = await Purchase.create({
    listing: listing._id,
    buyer: payment.user,
    seller: listing.owner,
    price: listing.price,
  });

  // Mark listing as sold
  listing.status = "sold";
  await listing.save();

  // Cleanup carts, wishlists & notify users
  await cleanupSoldListing(listing._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        payment,
        purchase,
      },
      "Payment verified & purchase completed"
    )
  );
});

