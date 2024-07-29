import { Router } from "express";
import {
  forgotPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
} from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/logout").get(verifyJWT, logoutUser);
router.route("/forgot-password").post(verifyJWT, forgotPassword);
router.route("/reset-password/:token").post(verifyJWT, resetPassword);

export default router;
