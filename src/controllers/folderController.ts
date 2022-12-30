import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Logger from "../common/logger";
import { FolderModel } from "./../models/Folder";

/**
 * Creates a folder with the `name` and `parentID` provided in `req.body`.
 *  Then it returns the newly created folder.
 *
 * @returns {mongoose.Document} The newly created folder
 */
async function createFolder(req: Request, res: Response, next: NextFunction) {
	try {
		const { name, parentID } = req.body;

		const folder = new FolderModel({
			name,
			createdTime: Date.now().toString(),
			lastUpdatedTime: Date.now().toString(),
		});

		if (parentID.length) {
			if (!(await folderExists(parentID))) {
				return res.status(400).json({ error: `Folder with _id '${parentID}' does not exist` });
			}
			folder.parentID = new mongoose.Types.ObjectId(parentID);
		}
		//TODO: Continuar arreglando las otras funciones igual que esta
		const savedFolder = await folder.save();
		return res.status(201).json({ savedFolder });
	} catch (error) {
		Logger.error(error);
		return res.status(400).json({ error });
	}
}

async function folderExists(folderID: string) {
	const parentFolder = await FolderModel.findOne({ _id: folderID });
	if (!parentFolder) {
		return false;
	}
	return true;
}

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
