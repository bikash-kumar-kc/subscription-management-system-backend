import express from "express";
import { signIn, signOut, signUp } from "./auth.controller.js";
const AuthRoutes = express.Router();
import { validator } from "../../middleware/validator.js";
import UserValidation from "../../utils/validation/userValidation.js";

AuthRoutes.post("/signup",UserValidation.createUser,validator,signUp);
AuthRoutes.post("/signin",UserValidation.userLogin,validator,signIn);
AuthRoutes.post("/signout",signOut);

export default AuthRoutes;
