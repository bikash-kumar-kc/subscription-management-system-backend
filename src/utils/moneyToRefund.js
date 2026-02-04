const moneyToRefund = (price, returnPercentage = 60) => {
  if (typeof price !== "number" || price <= 0) {
    throw new Error("Price must be a positive number");
  }

  const refundAmount = Math.floor((returnPercentage / 100) * price);
  return { refundAmount, refundPercentage: returnPercentage };
};

export default moneyToRefund;
