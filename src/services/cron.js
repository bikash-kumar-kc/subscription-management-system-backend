import Subscription from "../resources/subscriptionResources/subscription.model.js";
import config from "../config/config.js";
const cronsJobController = async (req, res) => {
  try {
    const result_1 = await Subscription.updateMany(
      {
        status: "active",
        renewalsDate: { $lt: new Date() },
      },
      {
        $set: {
          status: "expired",
        },
      },
    );

    const result_2 = await Subscription.updateMany(
      {
        $expr: {
          $gte: [
            { $subtract: ["$$NOW", "$startDate"] },
            1000 * 60 * 60 * 24 * 7,
          ],
        },
        status: "active",
      },
      [
        {
          $set: {
            canRenew: true,
          },
        },
      ],
      { updatePipeline: true },
    );

    console.log(`Expired: ${result_1.modifiedCount}`);
    console.log(`Can Renew: ${result_2.modifiedCount}`);

    return res.status(200).json({ success: true });
  } catch (err) {
    const isProduction = config.NODE_ENV === "production" ? true : false;
    const error = {
      message: isProduction ? "problem in crons job" : err.message,
      stack: isProduction ? undefined : err.stack,
      statusCode: err.statusCode || 500,
    };

    return res.status(error.statusCode).json({ error: error });
  }
};

export default cronsJobController;
