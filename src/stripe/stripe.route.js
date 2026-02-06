import express from "express";
import { paymentInitiator } from "./stripe.controller.js";
import authenticate from "../middleware/authenticate.js";
const stripeRouter = express.Router();

stripeRouter.post("/paymentInitialize",authenticate, paymentInitiator);
export default stripeRouter;
