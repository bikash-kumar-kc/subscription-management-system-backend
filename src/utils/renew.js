const discount = {
  7: 20,
  3: 10,
  2: 7.5,
  1: 5,
};

const calculateNewPrice = (acutalPrice, renewalsDate) => {
  let timeLeft = (renewalsDate - new Date()).getDate();
  if (timeLeft >= 7) {
    timeLeft = "7";
  } else if (timeLeft < 7 || timeLeft >= 3) {
    timeLeft = "3";
  }
  return Math.ceil(acutalPrice - (discount[timeLeft] / 100) * acutalPrice);
};


export default calculateNewPrice;
