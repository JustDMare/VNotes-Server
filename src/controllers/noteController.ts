import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { NoteModel } from "../models/Note";

function createNote(req: Request, res: Response, next: NextFunction) {
	const { noteID, title, parentID } = req.body;

	const note = new NoteModel({
		_id: new mongoose.Types.ObjectId(),
		noteID,
		parentID,
		title,
		createdTime: Date.now().toString(),
		lastUpdatedTime: Date.now().toString(),
	});

	return note
		.save()
		.then((note) => res.status(201).json({ note }))
		.catch((error) => res.status(500).json({ error }));
}
function deleteNote(req: Request, res: Response, next: NextFunction) {
	const note = NoteModel.findOneAndDelete({ noteID: req.params.noteID });

	return note
		.then((note) =>
			note
				? res.status(201).json({ note, message: "Note deleted" })
				: res.status(404).json({ message: "Note not found" })
		)
		.catch((error) => res.status(500).json({ error }));
}

export const noteController = {
	createNote,
	deleteNote,
};
