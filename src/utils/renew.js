const discount = {
  7: 20,
  3: 10,
  2: 7.5,
  1: 5,
};

const calculateNewPrice = (actualPrice, renewalDate) => {
  const msPerDay = 1000 * 60 * 60 * 24;

  const timeLeft = Math.ceil((new Date(renewalDate) - new Date()) / msPerDay);

  let key;

  if (timeLeft >= 7) key = 7;
  else if (timeLeft >= 3) key = 3;
  else if (timeLeft >= 2) key = 2;
  else key = 1;

  const discountedPrice = actualPrice - (discount[key] / 100) * actualPrice;

  return Math.ceil(discountedPrice);
};

export default calculateNewPrice;
