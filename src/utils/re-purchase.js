const calculateRePurchasePrice = (price, discount = 5) => {
  if (typeof price !== "number" || price <= 0) {
    throw new Error("Price must be a positive number");
  }

  const discountedPrice = price - (discount / 100) * price;
  return Math.ceil(discountedPrice);
};

export default calculateRePurchasePrice;
