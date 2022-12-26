import { FolderModel } from "./../models/Folder";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

const createFolder = (req: Request, res: Response, next: NextFunction) => {
	const { folderID, name, parentID } = req.body;

	const note = new FolderModel({
		folderID,
		parentID,
		name,
		lastUpdatedTime: Date.now().toString(),
		createdTime: Date.now().toString(),
	});

	return note
		.save()
		.then((book) => res.status(201).json({ book }))
		.catch((error) => res.status(500).json({ error }));
};

export const folderController = {
	createFolder,
};
