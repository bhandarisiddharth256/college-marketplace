import razorpay from "../config/razorpay.js";
import Payment from "../models/Payment.model.js";
import Purchase from "../models/Purchase.model.js";
import Listing from "../models/Listing.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/* Refund the authenticated buyer's payment and cancel the purchase. */
export const refundOrder = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findOneAndUpdate(
    {
      _id: paymentId,
      user: req.user._id,
      status: "paid",
    },
    { $set: { status: "refunding" } },
    { new: true }
  );

  if (!payment) {
    throw new ApiError(404, "Payment not found or not eligible for refund");
  }

  let refund;
  try {
    refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: Math.round(payment.amount * 100),
    });
  } catch (error) {
    await Payment.updateOne(
      { _id: payment._id, status: "refunding" },
      { $set: { status: "paid" } }
    );
    throw error;
  }

  await Payment.updateOne(
    { _id: payment._id, status: "refunding" },
    { $set: { status: "refunded" } }
  );

  await Purchase.updateOne(
    { listing: payment.listing, buyer: payment.user, status: "completed" },
    { $set: { status: "cancelled" } }
  );

  // Relist only this listing; retain its deletion state.
  await Listing.updateOne(
    { _id: payment.listing, status: "sold" },
    { $set: { status: "available" } }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { refundId: refund.id, paymentId: payment._id },
      "Refund processed successfully"
    )
  );
});
