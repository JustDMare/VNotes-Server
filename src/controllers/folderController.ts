import { NextFunction, Request, Response } from "express";
import mongoose, { isValidObjectId } from "mongoose";
import Logger from "../common/logger";
import { FolderModel } from "./../models/Folder";

/**
 * Creates a folder with the `name` and `parentID` provided in `req.body`.
 *  Then it returns the newly created folder.
 *
 * @returns The newly created folder
 */
async function createFolder(req: Request, res: Response, next: NextFunction) {
	const { name, parentID } = req.body;

	const folder = new FolderModel({
		name,
		createdTime: Date.now().toString(),
		lastUpdatedTime: Date.now().toString(),
	});

	if (parentID.length) {
		try {
			await checkFolderExists(parentID);
		} catch (error) {
			return res.status(400).json({ error: (<Error>error).message });
		}
		folder.parentID = new mongoose.Types.ObjectId(parentID);
	}
	return folder
		.save()
		.then((folder) => res.status(201).json({ folder }))
		.catch((error) => {
			Logger.error(error);
			return res.status(500).json({ error });
		});
}

/**
 * Deletes the folder that matches the `_id` in `req.params`.
 * 	Then returns the deleted folder if any. Otherwise it returns an error.
 *
 * @returns the deleted folder.
 */
async function deleteFolder(req: Request, res: Response, next: NextFunction) {
	const folderID = req.params.id;
	try {
		checkValidObjetId(folderID);
	} catch (error) {
		return res.status(400).json({ error: (<Error>error).message });
	}

	const folder = await FolderModel.findOne({ _id: req.params.id });
	if (!folder) {
		return res.status(404).json({ message: `Folder with _id '${folderID}' not found` });
	}
	folder
		.remove()
		.then((folder) => res.status(201).json({ folder, message: `Folder deleted` }))
		.catch((error) => res.status(500).json({ error }));
}

/**
 * Updates the `name` of the folder matching the `_id`. Both fields provided in
 * 	`req.body`. Then it returns the updated document.
 *  Returns an error if no document matching the provided `_id` is found.
 *
 * @returns the updated folder.
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
 * @returns the updated folder.
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

// HELPER FUNCTIONS

/**
 * Helper function used to check if a folder with an `_id` equal to the given `folderID` exists in the database
 *  when assigning it as a parent of another folder. It also checks if the given `folderID` is a valid ObjectId.
 *
 * @param {string} folderID `_id` of the folder to find.
 * @throws Error if `folderID` is not a valid ObjectId.
 * @throws Error if no folder is found.
 */
async function checkFolderExists(folderID: string) {
	//TODO: Cambiar para que devuelva un res.status en vez de error?
	checkValidObjetId(folderID);
	try {
		const folder = await FolderModel.findOne({ _id: folderID });
		if (!folder) {
			throw new Error(`Folder with _id '${folderID}' does not exist`);
		}
	} catch (error) {
		Logger.error(error);
		throw new Error(
			`Error while searching for folder with _id '${folderID}: ${(<Error>error).message}`
		);
	}
}

/**
 * Helper function that checks if the `id` passed as a parameter is a valid ObjectId
 *
 * @param {string} id to check if it is a valid ObjectId.
 * @throws error if `id` is not a valid ObjectId
 */
function checkValidObjetId(id: string) {
	if (!isValidObjectId(id)) {
		throw new Error(`Wrong format for _id '${id}'. Can't be converted to ObjectId`);
	}
}
