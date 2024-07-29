import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmailWithData } from "../utils/sendEmailWithData.js";

const generateAccessTokenandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      `Error while generating token also ${error.message}`,
      500
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, profile } = req.body;

  // Input validation
  if (
    !username ||
    !email ||
    !password ||
    !profile ||
    !profile.firstName ||
    !profile.lastName ||
    !profile.bio
  ) {
    throw new ApiError("Please fill all the details", 400);
  }

  // Check if the user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError("User already exists", 409);
  }

  const user = await User.create({
    username,
    email,
    password,
    profile,
  });

  if (user) {
    const createdUser = await User.findById(user._id).select("-password");
    const { accessToken, refreshToken } = generateAccessTokenandRefreshToken(
      createdUser._id
    );

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    };

    res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          {
            _id: createdUser._id,
            username: createdUser.username,
            email: createdUser.email,
            profile: createdUser.profile,
            timeStamp: {
              createdAt: createdUser.createdAt,
              updatedAt: createdUser.updatedAt,
            },
            refreshToken,
          },
          "You have been registered successfully"
        )
      );
  } else {
    throw new ApiError("Invalid user data", 400);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ApiError("Invalid Credentials", 400);
  }

  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(
      "You are not registered, Please register before logging",
      404
    );
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError("Invalid user credentials", 401);
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenandRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(
      new ApiResponse(
        { loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse({}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError("Email required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError("User with this email does not exists", 401);
  }

  const resetToken = jwt.sign(
    { _id: user._id },
    process.env.RESET_PASSWORD_TOKEN,
    { expiresIn: "1h" }
  );

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/reset-password/${resetToken}`;

  await sendEmailWithData(
    email,
    "Password Reset Link",
    `<p>You have requested to reset your password. Click <a href="${resetUrl}">here</a> to reset your password.</p>`
  );

  res
    .status(200)
    .json(
      new ApiResponse({}, "Password reset email has been sent to your email")
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!token) {
    throw new ApiError("Reset token is required", 400);
  }

  const decodedToken = jwt.verify(token, process.env.RESET_PASSWORD_TOKEN);
  console.log(decodedToken);
  if (!decodedToken || !decodedToken._id) {
    throw new ApiError("Invalid reset token", 400);
  }

  const user = await User.findById(decodedToken?._id);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const { password } = req.body;
  user.password = password;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse({}, "Password changed successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
};
