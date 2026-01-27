import { config } from "dotenv";
import { generateToken } from "../../services/jwt.js";
import UserModel from "../userResources/user.model.js";
import mongoose from "mongoose";

export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    const isExist = await UserModel.isUserExist(email);
    console.log("isExist", isExist);

    if (isExist) {
      const error = new Error("User already exist");
      error.statusCode = 400;
      next(error);
      return;
    }
    const newUser = await UserModel.create(
      [{ name: name, email: email, password: password }],
      { session },
    );

    console.log("user::: ", newUser);

    const token = generateToken(newUser[0]._id);
    console.log("token:: ", token);
    if (!token) {
      const error = new Error("Failed to generate token");
      error.statusCode = 500;
      next(error);
      return;
    }

    const isProduction = !(config.NODE_ENV === "development");
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction ? true : false,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    };

    res.cookie("accessToken", token, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "User created Successfully!",
      data: {
        user: newUser[0],
      },
      token,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    const error = new Error("Problem in server");
    error.errors = err.errors;
    next(error);
    return;
  }
};
