import { FolderModel } from "./../models/Folder";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

function createFolder(req: Request, res: Response, next: NextFunction) {
	const { name, parentID } = req.body;

	const folder = new FolderModel({
		parentID,
		name,
		createdTime: Date.now().toString(),
		lastUpdatedTime: Date.now().toString(),
	});

	return folder
		.save()
		.then((folder) => res.status(201).json({ folder }))
		.catch((error) => res.status(500).json({ error }));
}

function deleteFolder(req: Request, res: Response, next: NextFunction) {
	const folder = FolderModel.findOneAndDelete({ _id: req.params.id });

	return folder
		.then((folder) =>
			folder
				? res.status(201).json({ folder, message: "Folder deleted" })
				: res.status(404).json({ message: "Folder not found" })
		)
		.catch((error) => res.status(500).json({ error }));
}

export const folderController = {
	createFolder,
	deleteFolder,
};
