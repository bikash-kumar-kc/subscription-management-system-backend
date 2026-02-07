import { config } from "../config/config.js";
import calculateRePurchasePrice from "../utils/re-purchase.js";
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
    let newRepurchaseAmount;
    let discount_rate;
    let isStatus = status === "expired" || status === "cancel";
console.log("item",item)
    if (isStatus) {
      const { newRepurchasePrice, discountRate } = calculateRePurchasePrice(
        item.price
      );
      newRepurchaseAmount = newRepurchasePrice;
      discount_rate = discountRate;
    };

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
            unit_amount: isStatus ? newRepurchaseAmount : item.amount,
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
        userId:userId,
        orderId:orderId,
        serviceProvider:serviceProvider,
        productStatus: status,
        discount_rate:String(discount_rate),
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
