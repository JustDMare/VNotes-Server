import { folderController } from "../controllers/folder-controller";
import express from "express";
import { checkJwt } from "../server";

const router = express.Router();

router.post("/create", checkJwt, folderController.createFolder);
router.delete("/delete/:id", checkJwt, folderController.deleteFolder);
router.post("/rename", checkJwt, folderController.updateFolderName);
router.post("/move", checkJwt, folderController.updateFolderParentId);

export default router;
