import express from "express";
import http from "http";
import mongoose from "mongoose";
import { config } from "./config/default";

const router = express();

mongoose
	.connect(config.mongo.url, { retryWrites: true, writeConcern: { w: "majority" } })
	.then(() => console.log("Connected to MongoDB"))
	.catch((error) => console.log(error));
