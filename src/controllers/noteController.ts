import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { NoteModel } from "../models/Note";

const createNote = (req: Request, res: Response, next: NextFunction) => {
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
		.then((book) => res.status(201).json({ book }))
		.catch((error) => res.status(500).json({ error }));
};

export const noteController = {
	createNote,
};
