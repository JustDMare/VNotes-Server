import { noteController } from "../controllers/noteController";
import express from "express";

const router = express.Router();

router.post("/create", noteController.createNote);
router.delete("/delete/:noteID", noteController.deleteNote);

export default router;
