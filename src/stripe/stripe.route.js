import express from "express";
import { paymentInitiator } from "./stripe.controller";
const stripeRouter = express.Router();

stripeRouter.post("/paymentIntialize", paymentInitiator);
