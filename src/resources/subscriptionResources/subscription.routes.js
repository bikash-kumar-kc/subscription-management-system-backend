import express from "express";
import {
  cancelSubscription,
  createSubscription,
  getUserSubscriptions,
  renewSubscription,
  repurchaseSubscription,
} from "./subscription.controller.js";
import authenticate from "../../middleware/authenticate.js";

const SubscriptionRoutes = express.Router();

SubscriptionRoutes.get("/", authenticate, getUserSubscriptions);

SubscriptionRoutes.post("/", authenticate, createSubscription);

SubscriptionRoutes.delete("/:id", async (req, res) =>
  res.send({ message: "Delete a subscription" }),
);

SubscriptionRoutes.get("/user/:id", authenticate, getUserSubscriptions);
SubscriptionRoutes.put("/user/cancel/:id", authenticate, cancelSubscription);
SubscriptionRoutes.get("/upcomming-renewals", async (req, res) =>
  res.send({ message: "Get all upcomming renewels" }),
);

SubscriptionRoutes.put("/repurchase/:id", authenticate, repurchaseSubscription);
SubscriptionRoutes.put("/renew/:id", authenticate, renewSubscription);

SubscriptionRoutes.get("/:id", async (req, res) =>
  res.send({ message: "Get a subscription" }),
);

export default SubscriptionRoutes;
