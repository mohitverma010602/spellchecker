import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("bearer", "");

    if (!token) {
      throw new ApiError("Unauthorized request", 401);
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError("Invalid Access Token", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(error?.message || "Invalid Access Token", 401);
  }
});
