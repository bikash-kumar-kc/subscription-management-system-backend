import express from "express";
import {
  cancelSubscription,
  cancelSubscriptions,
  createSubscription,
  deleteSubscription,
  deleteSubscriptions,
  getUserSubscription,
  getUserSubscriptions,
  pauseSubscription,
  renewSubscription,
  repurchaseSubscription,
  resumeSubscription,
  upcommingRenewalsSubscriptions,
} from "./subscription.controller.js";
import authenticate from "../../middleware/authenticate.js";

const SubscriptionRoutes = express.Router();

SubscriptionRoutes.get("/", authenticate, getUserSubscriptions);

SubscriptionRoutes.post("/", authenticate, createSubscription);
SubscriptionRoutes.delete(
  "/deleteSubscriptions",
  authenticate,
  deleteSubscriptions,
);
SubscriptionRoutes.delete("/:id", authenticate, deleteSubscription);

SubscriptionRoutes.get("/user/:id", authenticate, getUserSubscriptions);
SubscriptionRoutes.put("/user/cancel/:id", authenticate, cancelSubscription);
SubscriptionRoutes.get(
  "/upcomming-renewals",
  authenticate,
  upcommingRenewalsSubscriptions,
);

SubscriptionRoutes.put("/repurchase/:id", authenticate, repurchaseSubscription);
SubscriptionRoutes.put("/renew/:id", authenticate, renewSubscription);
SubscriptionRoutes.put("/paush/:id", authenticate, pauseSubscription);
SubscriptionRoutes.patch("/resume/:id", authenticate, resumeSubscription);
SubscriptionRoutes.patch(
  "/cancelSubscriptions",
  authenticate,
  cancelSubscriptions,
);

SubscriptionRoutes.get("/:id", authenticate, getUserSubscription);

export default SubscriptionRoutes;
