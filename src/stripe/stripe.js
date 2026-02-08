import { config } from "../config/config.js";
import calculateRePurchasePrice from "../utils/re-purchase.js";
import calculateNewPrice from "../utils/renew.js";
import stripe from "./client.js";

const stripePaymentProcess = async ({
  paymentMethod,
  mode = "subscription",
  item,
  userId,
  orderId,
  serviceProvider,
  status,
  frequency,
  subscriptionId,
}) => {
  try {
    let newRepurchaseAmount, renewPrice, renewDiscountPercent, discount_rate;
    let isStatus = status === "expired" || status === "cancel";
    let isStatusActive = status === "active";
    console.log("isStatus",isStatus);
    console.log("isStatusActive",isStatusActive)

    if (isStatus) {
      const { newRepurchasePrice, discountRate } = calculateRePurchasePrice(
        item.price,
      );
      newRepurchaseAmount = newRepurchasePrice;
      discount_rate = discountRate;
    }

    if (isStatusActive) {
      const { price, discountPercent } = calculateNewPrice(
        item.price,
        item.renewalDate,
      );
      renewPrice = price;
      renewDiscountPercent = discountPercent;
      console.log("price",price);
      console.log("renewDiscountPercent",renewDiscountPercent);
      console.log("-----------------status is active---------------")
    }

    const dis=discount_rate || renewDiscountPercent;
    console.log("dis",dis)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: [paymentMethod || "card"],
      mode,
      line_items: [
        {
          price_data: {
            currency: item.currency,
            product_data: {
              name: item.name,
            },
            unit_amount:
              isStatus || isStatusActive
                ? isStatus
                  ? newRepurchaseAmount
                  : renewPrice
                : item.amount,
            recurring: {
              interval: frequency || "month",
            },
          },
          quantity: item.quantity,
        },
      ],
      success_url: config.SUCCESS_URL,
      cancel_url: config.UNSUCCESS_URL,
      metadata: {
        userId: userId,
        orderId: orderId,
        serviceProvider: serviceProvider,
        productStatus: status,
        discount_rate: String(dis),
        subscriptionId,
      },
    });

    return session.url;
  } catch (error) {
    console.log("Problem in Creating Problem!!!");
    throw error;
  }
};

export default stripePaymentProcess;
