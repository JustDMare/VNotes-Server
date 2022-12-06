import express from "express";
import http from "http";
import Logger from "./common/logger";
import { config } from "./config/default";

export const router = express();

export default function startServer(): void {
	//TODO: Review if this is ok
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

	//TODO: Review if more rules need implementation
	router.use((req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");
		res.header(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept, Authorization"
		);

		if (req.method == "OPTIONS") {
			res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
			return res.status(200).json({});
		}

		next();
	});

	/** Healthcheck */
	router.get("/ping", (req, res, next) => res.status(200).json({ hello: "world" }));

	/** Error handling */
	router.use((req, res, next) => {
		const error = new Error("Page not found");

		Logger.error(error);

		res.status(404).json({
			message: error.message,
		});
	});

	//TODO: Change to HTTPS
	http
		.createServer(router)
		.listen(config.server.port, () =>
			Logger.info(`Server is running on port ${config.server.port}`)
		);
}
