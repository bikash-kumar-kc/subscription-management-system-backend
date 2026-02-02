import express from "express";
import { createSubscription, getUserSubscription } from "./subscription.controller.js";
import authenticate from "../../middleware/authenticate.js";

const SubscriptionRoutes = express.Router();

SubscriptionRoutes.get("/", async (req, res) =>
  res.send({ message: "Get all subscriptions" }),
);

SubscriptionRoutes.post("/",authenticate, createSubscription);

SubscriptionRoutes.delete("/:id", async (req, res) =>
  res.send({ message: "Delete a subscription" }),
);

SubscriptionRoutes.get("/user/:id",authenticate,getUserSubscription);
SubscriptionRoutes.put("/user/cancel/:id", async (req, res) =>
  res.send({ message: "Cancel a subscription" }),
);
SubscriptionRoutes.get("/upcomming-renewals", async (req, res) =>
  res.send({ message: "Get all upcomming renewels" }),
);

SubscriptionRoutes.get("/:id", async (req, res) =>
  res.send({ message: "Get a subscription" }),
);

export default SubscriptionRoutes;
