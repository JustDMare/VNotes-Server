import { NextFunction, Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import Logger from "../common/logger";
import { FolderModel } from "../models/Folder";
import { checkFolderExists, checkValidObjetId } from "./common-helpers";

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

	try {
		checkValidObjetId(_id);
	} catch (error) {
		return res.status(400).json({ error: (<Error>error).message });
	}

	return FolderModel.findOne(
		{ _id: _id },
		{
			name,
			lastUpdatedTime: Date.now().toString(),
		},
		{ new: true }
	)
		.then((folder) =>
			folder
				? res.status(201).json({ folder, message: "Folder renamed" })
				: res.status(404).json({ message: `Folder with _id '${_id}' not found` })
		)
		.catch((error) => res.status(500).json({ error }));
}

/**
 * Updates the `parentID` of the folder matching the `_id`. Both fields provided in
 * 	`req.body`. Then it returns the updated folder.
 * Returns an error if no folder matching the provided `_id` is found, if the common
 * 		checks fail or if the `parentID` and `_id` contain the same value.
 *
 * @returns the updated folder.
 */
async function updateFolderParentID(req: Request, res: Response, next: NextFunction) {
	const { _id, parentID } = req.body;
	let parentObjectId: Types.ObjectId | null = null;

	if (parentID === _id) {
		return res.status(400).json({ message: "A Folder cannot be its own parent" });
	}

	if (parentID.length) {
		try {
			checkValidObjetId(_id);
			await checkFolderExists(parentID);
		} catch (error) {
			return res.status(400).json({ error: (<Error>error).message });
		}
		const parentIdBelongsToChildFolder = await checkParentIdBelongsToChildFolder(_id, parentID);
		if (parentIdBelongsToChildFolder) {
			console.log("a");
			return res.status(400).json({
				message: `Folder with _id '${_id}' is a parent Folder of '${parentID}', so it can't be moved`,
			});
		}
		parentObjectId = new mongoose.Types.ObjectId(parentID);
	}

	return FolderModel.findOneAndUpdate(
		{ _id: _id },
		{
			parentID: parentObjectId,
			lastUpdatedTime: Date.now().toString(),
		},
		{ new: true }
	)
		.then((folder) =>
			folder
				? res.status(201).json({ folder, message: "Folder moved" })
				: res.status(404).json({ message: `Folder with _id '${_id}' not found` })
		)
		.catch((error) => res.status(500).json({ error }));
}

export const folderController = {
	createFolder,
	deleteFolder,
	updateFolderName,
	updateFolderParentID,
};

/**
 * Checks if the `parentID` given as a paremeter belongs to a child folder (be it a direct child or an indirect child).
 * 	This is done to avoid circular nesting by having a folder be a child of its own child.
 * Returns false if `parentID` **does not** belong to a child folder. True otherwise.
 *
 * @param {string} folderID `_id` of the folder that is being checked as a parent of `checkedFolderId`
 * @param {string} checkedFolderId `_id` of the folder that is going to be checked as a child of `folderID`
 * @returns {boolean} false if `parentID` **does not** belong to a child folder. True otherwise.
 */
async function checkParentIdBelongsToChildFolder(folderID, checkedFolderId) {
	const checkedFolder = await FolderModel.findOne({ _id: checkedFolderId });
	console.log(checkedFolder);
	if (!checkedFolder) {
		throw new Error(`Error while searching folder with _id '${checkedFolderId}'`);
	}
	if (!checkedFolder.parentID) {
		return false;
	} else if (checkedFolder.parentID.toString() === folderID) {
		return true;
	} else {
		return await checkParentIdBelongsToChildFolder(folderID, checkedFolder.parentID);
	}
}
