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
function updateFolderName(req: Request, res: Response, next: NextFunction) {
	const { _id, name } = req.body;

	return FolderModel.findOneAndUpdate(
		_id,
		{
			name,
			lastUpdatedTime: Date.now().toString(),
		},
		{ new: true }
	)
		.then((folder) =>
			folder
				? res.status(201).json({ folder, message: "Folder renamed" })
				: res.status(404).json({ message: "Folder not found" })
		)
		.catch((error) => res.status(500).json({ error }));
}
function updateFolderParentID(req: Request, res: Response, next: NextFunction) {
	const { _id, parentID } = req.body;

	return FolderModel.findOneAndUpdate(
		_id,
		{
			parentID,
			lastUpdatedTime: Date.now().toString(),
		},
		{ new: true }
	)
		.then((folder) =>
			folder
				? res.status(201).json({ folder, message: "Folder moved" })
				: res.status(404).json({ message: "Folder not found" })
		)
		.catch((error) => res.status(500).json({ error }));
}
export const folderController = {
	createFolder,
	deleteFolder,
	updateFolderName,
	updateFolderParentID,
};
