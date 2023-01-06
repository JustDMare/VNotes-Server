import { noteController } from "../controllers/note-controller";
import express from "express";

const router = express.Router();
router.get("/:id", noteController.findNote);
router.post("/create", noteController.createNote);
router.delete("/delete/:id", noteController.deleteNote);
router.post("/update-content", noteController.updateNoteContent);
router.post("/rename", noteController.updateNoteTitle);
router.post("/move", noteController.updateNoteParentId);

export default router;
