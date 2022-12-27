import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { NoteModel } from "../models/Note";

function createNote(req: Request, res: Response, next: NextFunction) {
	const { title, parentID } = req.body;

	const note = new NoteModel({
		parentID,
		title,
		createdTime: Date.now().toString(),
		lastUpdatedTime: Date.now().toString(),
		content: [],
	});

	return note
		.save()
		.then((note) => res.status(201).json({ note }))
		.catch((error) => res.status(500).json({ error }));
}
function deleteNote(req: Request, res: Response, next: NextFunction) {
	const note = NoteModel.findOneAndDelete({ _id: req.params.id });

	return note
		.then((note) =>
			note
				? res.status(201).json({ note, message: "Note deleted" })
				: res.status(404).json({ message: "Note not found" })
		)
		.catch((error) => res.status(500).json({ error }));
}

function updateNoteContent(req: Request, res: Response, next: NextFunction) {
	const { noteID, content } = req.body;

	//TODO: BlockModel
	//TODO: Loop creating blockModels out of the content
	// Subsitute the Notes content by the new content models
}

export const noteController = {
	createNote,
	deleteNote,
};
