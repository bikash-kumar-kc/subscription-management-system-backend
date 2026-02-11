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
import SubscriptionValidation from "../../utils/validation/subscriptionValidation.js";
import { validator } from "../../middleware/validator.js";

const SubscriptionRoutes = express.Router();

SubscriptionRoutes.get("/", authenticate, getUserSubscriptions);
SubscriptionRoutes.post("/", authenticate,SubscriptionValidation.createSubscription,validator, createSubscription);
SubscriptionRoutes.delete(
  "/deleteSubscriptions",
  authenticate,
  deleteSubscriptions,
);
SubscriptionRoutes.delete("/:id", authenticate, SubscriptionValidation.validationId,validator, deleteSubscription);
SubscriptionRoutes.get("/user/:id", authenticate,SubscriptionValidation.validationId,validator, getUserSubscriptions);
SubscriptionRoutes.put("/user/cancel/:id", authenticate, SubscriptionValidation.validationId,validator, cancelSubscription);
SubscriptionRoutes.get(
  "/upcomming-renewals",
  authenticate,
  upcommingRenewalsSubscriptions,
);
SubscriptionRoutes.put("/repurchase/:id", authenticate,SubscriptionValidation.validationId,validator, repurchaseSubscription);
SubscriptionRoutes.put("/renew/:id", authenticate,SubscriptionValidation.validationId,validator, renewSubscription);
SubscriptionRoutes.put("/paush/:id", authenticate,SubscriptionValidation.validationId,validator, pauseSubscription);
SubscriptionRoutes.patch("/resume/:id", authenticate,SubscriptionValidation.validationId,validator, resumeSubscription);
SubscriptionRoutes.patch(
  "/cancelSubscriptions",
  authenticate,
  cancelSubscriptions,
);

SubscriptionRoutes.get("/:id", authenticate,SubscriptionValidation.validationId,validator, getUserSubscription); // GET A SUBSCRIPTIONS...

export default SubscriptionRoutes;
