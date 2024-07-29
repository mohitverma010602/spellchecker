import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import textRouter from "./routes/text.routes.js";
import wordRouter from "./routes/word.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//Routes
app.use("/api/auth", authRouter);
app.use("/api/text", textRouter);
app.use("/api/word", wordRouter);

export { app };
