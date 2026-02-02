import express from "express";
import { deleteUser, getUser, getUsers, uploadProfile } from "./user.controller.js";
import authenticate from "../../middleware/authenticate.js";
import upload from "../../services/multer.js";

const UserRoutes = express.Router();

UserRoutes.get("/", authenticate, getUsers);

UserRoutes.get("/", authenticate, getUser);

UserRoutes.delete("/:id",authenticate,deleteUser);

UserRoutes.patch("/:id",authenticate,upload.single("profileImage"),uploadProfile);

export default UserRoutes;
