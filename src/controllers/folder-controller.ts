import { NextFunction, Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import Logger from "../common/logger";
import { FolderModel } from "../models/Folder";
import { checkFolderExists, checkValidObjetId } from "./common-helpers";

/**
 * Creates a folder with the `name` and `parentId` provided in `req.body`.
 *  Then it returns the newly created folder.
 *
 * @returns The newly created folder
 */
async function createFolder(req: Request, res: Response, next: NextFunction) {
	const { name, parentId, userSpaceId } = req.body;

	const folder = new FolderModel({
		name,
		userSpaceId,
		createdTime: Date.now().toString(),
		lastUpdatedTime: Date.now().toString(),
	});

	if (parentId.length) {
		try {
			await checkFolderExists(parentId);
		} catch (error) {
			return res.status(400).json({ error: (<Error>error).message });
		}
		folder.parentId = new mongoose.Types.ObjectId(parentId);
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
	const folderId = req.params.id;
	try {
		checkValidObjetId(folderId);
	} catch (error) {
		return res.status(400).json({ error: (<Error>error).message });
	}

	const folder = await FolderModel.findOne({ _id: folderId });
	if (!folder) {
		return res.status(404).json({ message: `Folder with _id '${folderId}' not found` });
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
 * Updates the `parentId` of the folder matching the `_id`. Both fields provided in
 * 	`req.body`. Then it returns the updated folder.
 * Returns an error if no folder matching the provided `_id` is found, if the common
 * 		checks fail or if the `parentId` and `_id` contain the same value.
 *
 * @returns the updated folder.
 */
async function updateFolderParentId(req: Request, res: Response, next: NextFunction) {
	const { _id, parentId } = req.body;
	let parentObjectId: Types.ObjectId | null = null;

	if (parentId === _id) {
		return res.status(400).json({ message: "A Folder cannot be its own parent" });
	}

	if (parentId.length) {
		try {
			checkValidObjetId(_id);
			await checkFolderExists(parentId);
		} catch (error) {
			return res.status(400).json({ error: (<Error>error).message });
		}
		const parentIdBelongsToChildFolder = await checkParentIdBelongsToChildFolder(_id, parentId);
		if (parentIdBelongsToChildFolder) {
			console.log("a");
			return res.status(400).json({
				message: `Folder with _id '${_id}' is a parent Folder of '${parentId}', so it can't be moved`,
			});
		}
		parentObjectId = new mongoose.Types.ObjectId(parentId);
	}

	return FolderModel.findOneAndUpdate(
		{ _id: _id },
		{
			parentId: parentObjectId,
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
	updateFolderParentId,
};

/**
 * Checks if the `parentId` given as a paremeter belongs to a child folder (be it a direct child or an indirect child).
 * 	This is done to avoid circular nesting by having a folder be a child of its own child.
 * Returns false if `parentId` **does not** belong to a child folder. True otherwise.
 *
 * @param {string} folderId `_id` of the folder that is being checked as a parent of `checkedFolderId`
 * @param {string} checkedFolderId `_id` of the folder that is going to be checked as a child of `folderId`
 * @returns {boolean} false if `parentId` **does not** belong to a child folder. True otherwise.
 */
async function checkParentIdBelongsToChildFolder(folderId, checkedFolderId) {
	const checkedFolder = await FolderModel.findOne({ _id: checkedFolderId });
	console.log(checkedFolder);
	if (!checkedFolder) {
		throw new Error(`Error while searching folder with _id '${checkedFolderId}'`);
	}
	if (!checkedFolder.parentId) {
		return false;
	} else if (checkedFolder.parentId.toString() === folderId) {
		return true;
	} else {
		return await checkParentIdBelongsToChildFolder(folderId, checkedFolder.parentId);
	}
}
