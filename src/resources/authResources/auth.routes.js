import express from "express";
import { signIn, signOut, signUp } from "./auth.controller.js";
const AuthRoutes = express.Router();

AuthRoutes.post("/signup",signUp);
AuthRoutes.post("/signin",signIn);
AuthRoutes.post("/signout",signOut);

export default AuthRoutes;
