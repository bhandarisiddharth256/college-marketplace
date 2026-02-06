import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { calculateSuggestedPrice } from "../services/priceEngine.service.js";

/* 🤖 AI Price Suggestion */
export const getPriceSuggestion = asyncHandler(async (req, res) => {
  const { basePrice, condition, ageInMonths, category } = req.body;

  if (
    !basePrice ||
    typeof basePrice !== "number" ||
    !condition ||
    !category
  ) {
    throw new ApiError(400, "Invalid price input data");
  }

  const priceData = calculateSuggestedPrice({
    basePrice,
    condition,
    ageInMonths,
    category,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      priceData,
      "AI price suggestion generated"
    )
  );
});
