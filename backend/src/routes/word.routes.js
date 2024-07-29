import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { wordFinder } from "../controllers/word.controllers.js";

const router = Router();

router.route("/find").post(verifyJWT, wordFinder);

export default router;
