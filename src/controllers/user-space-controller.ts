import { UserSpaceModel } from "./../models/UserSpace";
import { NextFunction, Request, Response } from "express";
import Logger from "../common/logger";
import { FolderModel } from "../models/Folder";
import { NoteModel } from "../models/Note";
import { FolderSchema, NoteSchema } from "vnotes-types";

/**
 * Creates a user space with the `userToken` provided in `req.body`.
 *  Then it returns the newly created user space.
 *
 * @returns The newly created user space
 */
async function createUserSpace(req: Request, res: Response, next: NextFunction) {
	const userSpace = new UserSpaceModel({ userToken: req.body.userToken });
	return userSpace
		.save()
		.then((userSpace) => res.status(201).json({ userSpace }))
		.catch((error) => {
			Logger.error(error);
			return res.status(500).json({ error });
		});
}

/**
 * Deletes the user space that matches the `userToken` in `req.params`.
 * 	Then returns the deleted user space if any. Otherwise it returns an error.
 *
 * @returns the deleted folder.
 */
//TODO: Create a middleware to delete everything related to this space (Notes/folders)
async function deteleUserSpace(req: Request, res: Response, next: NextFunction) {
	const userToken = req.params.token;

	const userSpace = await UserSpaceModel.findOne({ userToken });
	if (!userSpace) {
		return res.status(404).json({ message: `User space with userToken '${userToken}' not found` });
	}
	userSpace
		.remove()
		.then((userSpace) => res.status(201).json({ userSpace, message: `User Space deleted` }))
		.catch((error) => res.status(500).json({ error }));
}

/**
 * Retrieves all the data belonging to the `user space` that matches the given `userToken` alongisde with
 * 	all the folders and notes. Then processes them to return them in a tree-like structured format.
 *
 * @returns the user space data and a tree-like structure containing the folders and notes belonging to that space.
 */
async function findAllUserSpaceContent(req: Request, res: Response, next: NextFunction) {
	const userToken = req.params.token;

	const userSpaceDoc = await UserSpaceModel.findOne({ userToken });
	if (!userSpaceDoc) {
		return res.status(404).json({ message: `User space with userToken '${userToken}' not found` });
	}

	const userFoldersDocs = await FolderModel.find({ userSpaceId: userSpaceDoc._id })
		.sort({
			name: 1,
		})
		.select({ __v: 0 })
		.lean();
	const userNotesDocs = await NoteModel.find({ userSpaceId: userSpaceDoc._id })
		.sort({
			title: 1,
		})
		.select({ content: 0, __v: 0 })
		.lean();

	const dataTree = createDataTree(userFoldersDocs, userNotesDocs);
	return res.status(200).json({ dataTree });
}

function createDataTree(folders: FolderSchema[], notes: NoteSchema[]) {
	const hashTable = Object.create(null);
	folders.forEach(
		(folder) =>
			(hashTable[folder._id] = {
				...folder,
				content: { folders: [], notes: [] },
			})
	);
	notes.forEach((aData) => (hashTable[aData._id] = { ...aData }));
	const dataTree = { folders: [], notes: [] };
	folders.forEach((folder) => {
		if (folder.parentId)
			hashTable[folder.parentId.toString()].content.folders.push(hashTable[folder._id]);
		//@ts-ignore
		else dataTree.folders.push(hashTable[folder._id]);
	});
	notes.forEach((note) => {
		if (note.parentId) hashTable[note.parentId.toString()].content.notes.push(hashTable[note._id]);
		//@ts-ignore
		else dataTree.notes.push(hashTable[note._id]);
	});
	return dataTree;
}

export const userSpaceController = { createUserSpace, deteleUserSpace, findAllUserSpaceContent };
