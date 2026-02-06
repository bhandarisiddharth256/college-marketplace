const CONDITION_MULTIPLIER = {
  new: 1.0,
  "like-new": 0.9,
  used: 0.75,
};

const CATEGORY_DEMAND = {
  books: 0.85,
  electronics: 1.1,
  furniture: 0.9,
  others: 1.0,
};

export const calculateSuggestedPrice = ({
  basePrice,
  condition,
  ageInMonths = 0,
  category,
}) => {
  let price = basePrice;

  // Condition adjustment
  price *= CONDITION_MULTIPLIER[condition] || 1;

  // Age depreciation (2% per month, max 40%)
  const depreciation = Math.min(ageInMonths * 0.02, 0.4);
  price *= 1 - depreciation;

  // Category demand
  price *= CATEGORY_DEMAND[category] || 1;

  // Price range (+/- 10%)
  const minPrice = Math.round(price * 0.9);
  const maxPrice = Math.round(price * 1.1);

  return {
    suggestedPrice: Math.round(price),
    minPrice,
    maxPrice,
  };
};
