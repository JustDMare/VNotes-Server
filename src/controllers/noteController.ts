import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { NoteModel } from "../models/Note";

/**
 * Creates a note with the  `title` and `parentID` provided in `req.body`.
 *  Then it returns the newly created note.
 *
 * @returns {mongoose.Document} The newly created note
 */
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

/**
 * Deletes the note that matches the `_id` in `req.params`.
 * 	Then returns the deleted note if any. Otherwise it returns an error.
 *
 * @returns {mongoose.Document} the deleted note.
 */
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
/**
 * Overwrites the `content` of the note matching the  `_id`. Both fields provided in
 * 	{@field req.body}. Then it returns the updated note.
 *  Returns an error if no note matching the provided  `_id` is found.
 *
 * @returns {mongoose.Document} the updated note.
 */
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

/**
 * Updates the `title` of the folder matching the `_id`. Both fields provided in
 * 	`req.body`. Then it returns the updated note.
 *  Returns an error if no note matching the provided `_id` is found.
 *
 * @returns {mongoose.Document} the updated note.
 */
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

/**
 * Updates the `parentID` of the note matching the `_id`. Both fields provided in
 * 	`req.body`. Then it returns the updated note.
 *  Returns an error if no note matching the provided  `_id` is found.
 *
 * @returns {mongoose.Document} the updated note.
 */
function updateNoteParentID(req: Request, res: Response, next: NextFunction) {
	const { _id, parentID } = req.body;

	return NoteModel.findOneAndUpdate(
		_id,
		{
			parentID: new mongoose.Types.ObjectId(parentID),
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
