import { noteController } from "../controllers/note-controller";
import express from "express";
import { checkJwt } from "../server";

const router = express.Router();

router.post("/create", checkJwt, noteController.createNote);
router.post("/update-content", checkJwt, noteController.updateNoteContent);
router.post("/rename", checkJwt, noteController.updateNoteTitle);
router.post("/move", checkJwt, noteController.updateNoteParentId);
router.delete("/delete/:id", checkJwt, noteController.deleteNote);
router.get("/:id", checkJwt, noteController.findNote);

export default router;
