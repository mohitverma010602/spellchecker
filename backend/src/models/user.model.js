import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError.js";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    lastLogin: {
      type: Date,
      default: Date.now(),
    },
    profile: {
      firstName: String,
      lastName: String,
      bio: String,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true } // Automatically creates createdAt and updateAt fields
);

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    const apiError = new ApiError("Cannot save Password", 500);
    next(apiError);
  }
});

userSchema.methods.comparePassword = async function (userPassword) {
  try {
    return await bcrypt.compare(userPassword, this.password);
  } catch (error) {
    throw new ApiError("Unauthorized Access", 401);
  }
};

userSchema.methods.generateAccessToken = function () {
  try {
    return jwt.sign(
      {
        _id: this._id,
        username: this.username,
        email: this.email,
        lastLogin: this.lastLogin,
        role: this.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
  } catch (error) {
    console.log("Error while generating Access Token", error);
    throw new ApiError("Error while generating Access Token", 500);
  }
};

userSchema.methods.generateRefreshToken = function () {
  try {
    return jwt.sign(
      {
        _id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
  } catch (error) {
    console.log("Error while generating Refresh Token", error);
    throw new ApiError("Error while generating Refresh Token", 500);
  }
};

export const User = mongoose.model("User", userSchema);
