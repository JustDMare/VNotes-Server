import mongoose from "mongoose";
import Logger from "./common/logger";
import { config } from "./config/default";
import startServer from "./server";

mongoose
	.connect(config.mongo.url, {
		retryWrites: true,
		writeConcern: { w: "majority" },
	})
	.then(() => {
		Logger.success("Connected to MongoDB");
		startServer();
	})
	.catch((error) => Logger.error(error));
