import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import mongoose from "mongoose";

import UserModel from "./user.model.js";

import uploadFile, { deleteFile } from "../../services/cloudinary.js";
import { config } from "../../config/config.js";
import generatePublicKey from "../../utils/generatePublicKey.js";
import Subscription from "../subscriptionResources/subscription.model.js";
import PaymentModel from "../payment/payment.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getUsers = async (req, res, next) => {
  try {
    const role = req.user.role;
    if (!(role === "admin")) {
      return res.status(403).json({ success: false, message: "FORBIDDEN" });
    }

    const users = await UserModel.find().select("-password");

    return res.status(200).json({
      success: true,
      data: {
        users: users,
      },
    });
  } catch (err) {
    console.log(err);
    const error = new Error("Problem in getting all users");
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const id = req.user.id;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "id is required" });
    }

    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({
      success: true,
      data: {
        user: user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProfile = async (req, res, next) => {
  let filePath = null;
  try {
    const userId = req.params.id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User id is required !!!" });
    }

    if (userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "FORBIDDEN" });
    }

    const user = await UserModel.findById(userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!!!" });
    }

    const deletionErrors = [];

    // if profile already exists...
    if (user.imageUrl) {
      try {
        const publicKey = generatePublicKey(user.imageUrl);
        console.log("publicKey", publicKey);

        if (!publicKey) {
          deletionErrors.push({
            resource: "profile_image",
            error: "Unable to extract public key from image URL",
          });
        }

        const isImageDeleted = await deleteFile(publicKey);

        if (!isImageDeleted) {
          deletionErrors.push({
            resource: "profile_image",
            error: "Failed to delete profile image from cloud storage",
          });
        }
      } catch (imageErr) {
        console.error("Error deleting profile image:", imageErr);
        deletionErrors.push({
          resource: "profile_image",
          error: imageErr.message,
        });
      }
    }
    console.log(req.file);
    const coverImageMimeType = req.file.mimetype.split("/").at(-1);
    const fileName = req.file.filename;
    filePath = path.resolve(__dirname, "../../../public/resources", fileName);
    console.log("filePath", filePath);
    const uploadProfileImage = await uploadFile({
      file: filePath,
      fileName: fileName,
      folderName: "sms_users_profile_image",
      fileFormat: coverImageMimeType,
    });

    if (!uploadProfileImage) {
      return res
        .status(500)
        .json({ success: false, message: "IMAGE UPLOAD !!!" });
    }

    try {
      await fs.promises.unlink(req.file.path);
    } catch (unlinkErr) {
      console.error("Error deleting temporary file:", unlinkErr);
    }

    const updateUser = await UserModel.findByIdAndUpdate(
      user._id,
      {
        $set: {
          imageUrl: uploadProfileImage.secure_url,
        },
      },
      {
        new: true,
      },
    );

    return res.status(201).json({
      success: true,
      message: "User Updated Successfully!",
      data: {
        profileUrl: updateUser.imageUrl,
      },
      warning: deletionErrors.length > 0 ? deletionErrors : undefined,
    });
  } catch (err) {
    if (filePath) {
      try {
        await fs.promises.unlink(filePath);
      } catch (unlinkErr) {
        console.error("Error cleaning up file after error:", unlinkErr);
      }
    }

    console.error("Upload profile error:", err);

    const error = {
      message:
        config.NODE_ENV === "production"
          ? "An error occurred while uploading the profile image"
          : err.message,
      statusCode: err.statusCode || 500,
    };

    if (process.env.NODE_ENV !== "production") {
      error.stack = err.stack;
    }

    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const userId = req.params.id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User id is required!!!" });
    }

    if (userId !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "FORBIDDEN ACCESS!!!" });
    }

    const user = await UserModel.findById(userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "USER NOT FOUND!!!" });
    }

    session.startTransaction();

    console.info("User deletion initiated", {
      userId: user._id,
      email: user.email,
      timestamp: new Date().toISOString(),
    });

    const deletionErrors = [];

    // DELETE IMAGE...

    if (user.imageUrl) {
      try {
        const publicKey = generatePublicKey(user.imageUrl);

        if (publicKey) {
          const isImageDeleted = await deleteFile(publicKey);

          if (!isImageDeleted) {
            deletionErrors.push({
              resource: "profile_image",
              error: "Failed to delete profile image from cloud storage",
            });
          } else {
            deletionErrors.push({
              resource: "profile_image",
              error: "Unable to extract public key from image URL",
            });
          }
        }
      } catch (imageErr) {
        console.error("Error deleting profile image:", imageErr);
        deletionErrors.push({
          resource: "profile_image",
          error: imageErr.message,
        });
      }
    }

    // DELETE USER RELATED INFOS
    try {
      await PaymentModel.deleteMany([{userId:user._id}],{session})
      await Subscription.deleteMany([{ user: user._id }], { session });
    } catch (error) {
      console.error("Error during cascade deletion:", error);
      throw new Error("Failed to delete related user data");
    }

    const deleteUser = await UserModel.deleteOne([{ _id: user.id }], {
      session,
    });

    if (!deleteUser) {
      throw new Error("problem in deleting user!!!");
    }

    // Commit transaction
    await session.commitTransaction();

    // Delete cookies
    const isProduction = config.NODE_ENV === "production" ? true : false;
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction ? true : false,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    // Log successful deletion
    console.info("User deletion completed", {
      userId: user._id,
      email: user.email,
      timestamp: new Date().toISOString(),
      warnings: deletionErrors.length > 0 ? deletionErrors : undefined,
    });

    return res.status(200).json({
      success: true,
      message: "USER DELETED",
      data: { id: req.user.id },
    });
  } catch (err) {
    await session.abortTransaction();

    // Log error with context
    console.error("User deletion failed", {
      userId: req.params.id,
      error: err.message,
      stack: err.stack,
    });

    const isProduction = config.NODE_ENV === "production";

    const error = {
      message: isProduction
        ? "problem in deleting user's account"
        : err.message,
      statusCode: err.statusCode || 500,
      stack: isProduction ? undefined : err.stack,
    };

    next(error);
  } finally {
    session.endSession();
  }
};
