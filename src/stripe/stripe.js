import { config } from "../config/config.js";
import stripe from "./client.js";

const stripePaymentProcess = async ({
  paymentMethod,
  mode = "subscription",
  item,
  userId,
  orderId,
  serviceProvider,
}) => {
  try {
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
            unit_amount: item.amount || 1,
            recurring: {
              interval: "month",
            },
          },
          quantity: item.quantity,
        },
      ],
      success_url: config.SUCCESS_URL,
      cancel_url: config.UNSUCCESS_URL,
      metadata: {
        userId,
        orderId,
        serviceProvider,
      },
    });

    return session.url;
  } catch (error) {
    console.log("Problem in Creating Problem!!!");
    throw error;
  }
};

export default stripePaymentProcess;
