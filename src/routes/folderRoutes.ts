import { folderController } from "../controllers/folderController";
import express from "express";

const router = express.Router();

router.post("/create", folderController.createFolder);

export default router;
