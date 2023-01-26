import { noteController } from "../controllers/note-controller";

import express from "express";
import { checkNoteBelongsToUser } from "../middleware/resource-belongs-to-user";

const router = express.Router();

router.post("/create", checkNoteBelongsToUser, noteController.createNote);
router.post("/update-content", checkNoteBelongsToUser, noteController.updateNoteContent);
router.post("/rename", checkNoteBelongsToUser, noteController.updateNoteTitle);
router.post("/move", checkNoteBelongsToUser, noteController.updateNoteParentId);
router.delete("/delete/:id", checkNoteBelongsToUser, noteController.deleteNote);
router.get("/:id", checkNoteBelongsToUser, noteController.findNote);

export default router;
