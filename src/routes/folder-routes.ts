import { folderController } from "../controllers/folder-controller";
import express from "express";
import { checkFolderBelongsToUser } from "../middleware/resource-belongs-to-user";

const router = express.Router();

router.post("/create", checkFolderBelongsToUser, folderController.createFolder);
router.delete("/delete/:id", checkFolderBelongsToUser, folderController.deleteFolder);
router.post("/rename", checkFolderBelongsToUser, folderController.updateFolderName);
router.post("/move", checkFolderBelongsToUser, folderController.updateFolderParentId);

export default router;
