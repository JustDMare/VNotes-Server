import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { FolderModel } from "./../models/Folder";

/**
 * Creates a folder with the `name` and `parentID` provided in `req.body`.
 *  Then it returns the newly created folder.
 *
 * @returns {mongoose.Document} The newly created folder
 */
function createFolder(req: Request, res: Response, next: NextFunction) {
	const { name, parentID } = req.body;

	const folder = new FolderModel({
		name,
		createdTime: Date.now().toString(),
		lastUpdatedTime: Date.now().toString(),
	});
	console.log(parentID.length);
	if (parentID.length) {
		folder.parentID = new mongoose.Types.ObjectId(parentID);
	}

	return folder
		.save()
		.then((folder) => res.status(201).json({ folder }))
		.catch((error) => res.status(500).json({ error }));
}
//TODO: Change all .then() by await for cleaner code?

/**
 * Deletes the folder that matches the `_id` in `req.params`.
 * 	Then returns the deleted folder if any. Otherwise it returns an error.
 *
 * @returns {mongoose.Document} the deleted folder.
 */
function deleteFolder(req: Request, res: Response, next: NextFunction) {
	return FolderModel.findOne({ _id: req.params.id })
		.then((folder) => {
			if (folder) {
				folder
					.remove()
					.then((folder) =>
						folder
							? res.status(201).json({ folder, message: "Folder deleted" })
							: res.status(404).json({ message: "Folder not found" })
					)
					.catch((error) => res.status(500).json({ error }));
			} else {
				res.status(404).json({ message: "Folder not found" });
			}
		})
		.catch((error) => res.status(500).json({ error }));
}

/**
 * Updates the `name` of the folder matching the `_id`. Both fields provided in
 * 	`req.body`. Then it returns the updated document.
 *  Returns an error if no document matching the provided `_id` is found.
 *
 * @returns {mongoose.Document} the updated folder.
 */
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

/**
 * Updates the `parentID` of the folder matching the `_id`. Both fields provided in
 * 	`req.body`. Then it returns the updated folder.
 *  Returns an error if no folder matching the provided `_id` is found.
 *
 * @returns {mongoose.Document} the updated folder.
 */
function updateFolderParentID(req: Request, res: Response, next: NextFunction) {
	const { _id, parentID } = req.body;

	return FolderModel.findOneAndUpdate(
		_id,
		{
			parentID: new mongoose.Types.ObjectId(parentID),
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
