import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkText, getSuggestions } from "../controllers/text.controller.js";

const router = Router();

router.post("/check-grammer", verifyJWT, checkText);
router.post("/suggestions", verifyJWT, getSuggestions);
export default router;
