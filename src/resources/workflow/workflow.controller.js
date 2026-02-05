import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");
import dayjs from "dayjs";
import Subscription from "../subscriptionResources/subscription.model.js";
import { sendReminderEmail } from "../../utils/send-email.js";

const REMINDERS = [6, 5, 2, 1];

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;
  let subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription || subscription.status !== "active") return; // it stop the tracking the subscription...
  let renewalDate = dayjs(subscription.renewalsDate);

  if (renewalDate.isBefore(dayjs())) {
    console.log(
      `Renewal date has passed for subscription ${subscriptionId}.Stopping workflow`,
    );
    return;
  }

  for (const daysBefore of REMINDERS) {
    let reminderDate = renewalDate.subtract(daysBefore, "day");

    if (reminderDate.isAfter(dayjs())) {
      await sleepUntilReminder(
        context,
        `Remider ${daysBefore} days before`,
        reminderDate,
      );

      subscription = await fetchSubscription(context, subscriptionId);
      if (!subscription || subscription.status !== "active") return; // it stop the tracking the subscription...
      renewalDate = dayjs(subscription.renewalsDate);
      reminderDate = renewalDate.subtract(daysBefore, "day");
    }

    if (dayjs().isSame(reminderDate, "day"))
      await triggerReminder(
        context,
        `${daysBefore} days before reminder`,
        subscription,
      );
  }
});

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run(
    "get subscription",
    async () =>
      await Subscription.findById(subscriptionId).populate(
        "user",
        "name email",
      ),
  );
};

const sleepUntilReminder = async (context, label, date) => {
  console.log(`Sleeping until ${label} reminder at ${date}`);
  await context.sleepUntil(label, date.toDate());
};

const triggerReminder = async (context, label, subscription) => {
  return await context.run(label, async () => {
    console.log(`Triggering ${label} reminder`);

    await sendReminderEmail({
      to: subscription.user.email,
      type: label,
      subscription,
    });
  });
};
