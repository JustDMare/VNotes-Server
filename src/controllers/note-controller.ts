import { NextFunction, Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { NoteModel } from "../models/Note";
import { checkFolderExists, checkValidObjetId } from "./common-helpers";

/**
 * Creates a note with the  `title` and `parentID` provided in `req.body`.
 *  Then it returns the newly created note.
 *
 * @returns The newly created note
 */
async function createNote(req: Request, res: Response, next: NextFunction) {
	const { title, parentID } = req.body;

	const note = new NoteModel({
		parentID: null,
		title,
		createdTime: Date.now().toString(),
		lastUpdatedTime: Date.now().toString(),
		content: [],
	});
	if (parentID.length) {
		try {
			await checkFolderExists(parentID);
		} catch (error) {
			return res.status(400).json({ error: (<Error>error).message });
		}
		note.parentID = new mongoose.Types.ObjectId(parentID);
	}

	return note
		.save()
		.then((note) => res.status(201).json({ note, message: "Note created" }))
		.catch((error) => res.status(500).json({ error }));
}

/**
 * Deletes the note that matches the `_id` in `req.params`.
 * 	Then returns the deleted note if any. Otherwise it returns an error.
 *
 * @returns The deleted note.
 */
function deleteNote(req: Request, res: Response, next: NextFunction) {
	const noteID = req.params.id;
	try {
		checkValidObjetId(noteID);
	} catch (error) {
		return res.status(400).json({ error: (<Error>error).message });
	}

	return NoteModel.findOneAndDelete({ _id: req.params.id })
		.then((note) =>
			note
				? res.status(201).json({ note, message: "Note deleted" })
				: res.status(404).json({ message: `Note with _id '${noteID}' not found` })
		)
		.catch((error) => res.status(500).json({ error }));
}

/**
 * Overwrites the `content` of the note matching the  `_id`. Both fields provided in
 * 	`req.body`. Then it returns the updated note.
 *  Returns an error if no note matching the provided  `_id` is found.
 *
 * @returns The updated note.
 */
function updateNoteContent(req: Request, res: Response, next: NextFunction) {
	const { _id, title, content } = req.body;
	try {
		checkValidObjetId(_id);
	} catch (error) {
		return res.status(400).json({ error: (<Error>error).message });
	}

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
						: res.status(404).json({ message: `Note with _id '${_id}' not found` })
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
 * @returns The updated note.
 */
function updateNoteTitle(req: Request, res: Response, next: NextFunction) {
	const { _id, title } = req.body;

	try {
		checkValidObjetId(_id);
	} catch (error) {
		return res.status(400).json({ error: (<Error>error).message });
	}

	return NoteModel.findOneAndUpdate(
		{ _id: _id },
		{
			title,
			lastUpdatedTime: Date.now().toString(),
		},
		{ new: true }
	)
		.then((note) =>
			note
				? res.status(201).json({ note, message: "Note title updated" })
				: res.status(404).json({ message: `Note with _id '${_id}' not found` })
		)
		.catch((error) => res.status(500).json({ error }));
}

/**
 * Updates the `parentID` of the note matching the `_id`. Both fields provided in
 * 	`req.body`. Then it returns the updated note.
 *  Returns an error if no folder matching the provided `_id` is found, if the common
 * 		checks fail or if the `parentID` and `_id` contain the same value.
 *
 *
 * @returns The updated note.
 */
async function updateNoteParentID(req: Request, res: Response, next: NextFunction) {
	const { _id, parentID } = req.body;
	let parentObjectId: Types.ObjectId | null = null;

	if (parentID === _id) {
		return res.status(400).json({ message: "A Note cannot be its own parent" });
	}

	//TODO: Might be worth to refactor to another function?
	if (parentID.length) {
		try {
			checkValidObjetId(_id);
			await checkFolderExists(parentID);
		} catch (error) {
			return res.status(400).json({ error: (<Error>error).message });
		}
		parentObjectId = new mongoose.Types.ObjectId(parentID);
	}

	return NoteModel.findOneAndUpdate(
		{ _id: _id },
		{
			parentID: parentObjectId,
			lastUpdatedTime: Date.now().toString(),
		},
		{ new: true }
	)
		.then((note) =>
			note
				? res.status(201).json({ note, message: "Note moved" })
				: res.status(404).json({ message: `Note with _id '${_id}' not found` })
		)
		.catch((error) => res.status(500).json({ error }));
}

export const noteController = {
	createNote,
	deleteNote,
	updateNoteContent,
	updateNoteTitle,
	updateNoteParentID,
};
