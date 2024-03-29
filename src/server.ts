import express from "express";
import http from "http";
import Logger from "./common/logger";
import { config } from "./config/default";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
import noteRoutes from "./routes/note-routes";
import folderRoutes from "./routes/folder-routes";
import userSpaceRoutes from "./routes/user-space-routes";
import { auth } from "express-oauth2-jwt-bearer";

const REQUEST_LIMIT_PERIOD = 15 * 60 * 1000; //15min * 60s * 1000ms
export const router = express();

export default function startServer(): void {
  //For the moment CORS will allow connections from everywhere
  router.use(cors());
  router.options("*", cors());

  //Setting some basic HTTP headers for security
  router.use(helmet());

  // Limit requests done to the same endpoint
  const limiter = rateLimit({
    max: 200,
    windowMs: REQUEST_LIMIT_PERIOD,
    message: "This IP has performed too many requests, please try again in 15 minutes",
  });
  router.use(limiter);

  router.use((req, res, next) => {
    /** Log the req */
    Logger.log(
      `Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`
    );

    res.on("finish", () => {
      /** Log the res */
      Logger.log(
        `Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`
      );
    });

    next();
  });

  router.use(express.urlencoded({ extended: true }));
  router.use(express.json());
  router.use(cookieParser());

  router.use(
    auth({
      audience: process.env.AUTH0_AUDIENCE,
      issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    })
  );

  router.use("/notes", noteRoutes);
  router.use("/folders", folderRoutes);
  router.use("/user-space", userSpaceRoutes);

  /** Healthcheck */
  router.get("/ping", (req, res, next) => res.status(200).json({ ping: "pong" }));

  /** Error handling. */
  router.use((req, res, next) => {
    const error = new Error("Page not found");
    Logger.error(error);
    res.status(404).json({
      message: error.message,
    });
  });

  http
    .createServer(router)
    .listen(config.server.port, () =>
      Logger.info(`Server is running on port ${config.server.port}`)
    );
}
