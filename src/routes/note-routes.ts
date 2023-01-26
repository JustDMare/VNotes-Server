import { noteController } from "../controllers/note-controller";
import express from "express";

const router = express.Router();

router.post("/create", noteController.createNote);
router.post("/update-content", noteController.updateNoteContent);
router.post("/rename", noteController.updateNoteTitle);
router.post("/move", noteController.updateNoteParentId);
router.delete("/delete/:id", noteController.deleteNote);
router.get("/:id", noteController.findNote);

export default router;
