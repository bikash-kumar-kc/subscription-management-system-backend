import { CronJob } from "cron";
import Subscription from "../resources/subscriptionResources/subscription.model.js";

const startCronJobs = new CronJob(
  " 0 * * * * ",
  async () => {
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
      { updatePipeline: true }
    );

    console.log(`Marked ${result_1.modifiedCount} Subscription as expired`);
    console.log(`Marked ${result_2.modifiedCount} Subscription as can renew`);
  },
  () => console.log("status is checked!!!"),
  false,
);

export default startCronJobs;
