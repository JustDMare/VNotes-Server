import { NoteSchema } from "vnotes-types";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { NoteModel } from "../models/Note";

function createNote(req: Request, res: Response, next: NextFunction) {
	const { title, parentID } = req.body;

	const note = new NoteModel({
		parentID: null,
		title,
		createdTime: Date.now().toString(),
		lastUpdatedTime: Date.now().toString(),
		content: [],
	});
	if (parentID.length) {
		note.parentID = new mongoose.Types.ObjectId(parentID);
	}

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

//TODO: Change all .then() by await for cleaner code?
function updateNoteContent(req: Request, res: Response, next: NextFunction) {
	const { _id, title, content } = req.body;
	return NoteModel.findById(_id).then((note) => {
		if (note) {
			note.title = title;
			note.content = content;
			note.lastUpdatedTime = Date.now().toString();
			note
				.save()
				.then((note) =>
					note
						? res.status(201).json({ note, message: "Note updated" })
						: res.status(404).json({ message: "Note not found" })
				)
				.catch((error) => res.status(500).json({ error }));
		}
	});
}

function updateNoteTitle(req: Request, res: Response, next: NextFunction) {
	const { _id, title } = req.body;

	return NoteModel.findOneAndUpdate(
		_id,
		{
			title,
			lastUpdatedTime: Date.now().toString(),
		},
		{ new: true }
	)
		.then((note) =>
			note
				? res.status(201).json({ note, message: "Note title updated" })
				: res.status(404).json({ message: "Note not found" })
		)
		.catch((error) => res.status(500).json({ error }));
}
function updateNoteParentID(req: Request, res: Response, next: NextFunction) {
	const { _id, parentID } = req.body;

	return NoteModel.findOneAndUpdate(
		_id,
		{
			parentID,
			lastUpdatedTime: Date.now().toString(),
		},
		{ new: true }
	)
		.then((note) => {
			note
				? res.status(201).json({ note, message: "Note moved" })
				: res.status(404).json({ message: "Note not found" });
		})
		.catch((error) => res.status(500).json({ error }));
}

export const noteController = {
	createNote,
	deleteNote,
	updateNoteContent,
	updateNoteTitle,
	updateNoteParentID,
};
