import { folderController } from "../controllers/folderController";
import express from "express";

const router = express.Router();

router.post("/create", folderController.createFolder);
router.delete("/delete/:id", folderController.deleteFolder);

export default router;
