import razorpay from "../config/razorpay.js";
import Payment from "../models/Payment.model.js";
import Purchase from "../models/Purchase.model.js";
import Listing from "../models/Listing.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/* 🔁 Refund payment & cancel order */
export const refundOrder = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId);
  if (!payment || payment.status !== "paid") {
    throw new ApiError(400, "Payment not eligible for refund");
  }

  // Razorpay refund
  const refund = await razorpay.payments.refund(
    payment.razorpayPaymentId,
    {
      amount: payment.amount, // in paise
    }
  );

  // Update payment
  payment.status = "refunded";
  await payment.save();

  // Cancel purchase
  const purchase = await Purchase.findOne({
    listing: payment.listing,
    buyer: payment.user,
  });

  if (purchase) {
    purchase.status = "cancelled";
    await purchase.save();
  }

  // Relist item
  const listing = await Listing.findById(payment.listing);
  if (listing) {
    listing.status = "available";
    await listing.save();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        refundId: refund.id,
        paymentId: payment._id,
      },
      "Refund processed successfully"
    )
  );
});
