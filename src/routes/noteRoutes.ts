import { noteController } from "../controllers/noteController";
import express from "express";

const router = express.Router();

router.post("/create", noteController.createNote);
router.delete("/delete/:id", noteController.deleteNote);
router.post("/update-content", noteController.updateNoteContent);
router.post("/rename", noteController.updateNoteTitle);
router.post("/move", noteController.updateNoteParentID);

export default router;
