import express from "express";
import { paymentInitiator } from "./stripe.controller.js";
import authenticate from "../middleware/authenticate.js";
import PaymentValidation from "../utils/validation/paymentValidation.js";
const stripeRouter = express.Router();
import {validator} from "../middleware/validator.js"

stripeRouter.post("/paymentInitialize",authenticate,PaymentValidation.validatePayment,validator, paymentInitiator);
export default stripeRouter;
