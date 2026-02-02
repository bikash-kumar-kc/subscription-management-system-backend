const rePurchase = (price) => {
  const dis = 5;
  return Math.ceil(price - (dis / 100) * price);
};

export default rePurchase;
