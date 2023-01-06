import { UserSpaceModel } from "./../models/UserSpace";
import { NextFunction, Request, Response } from "express";
import Logger from "../common/logger";
import { FolderModel } from "../models/Folder";
import { NoteModel } from "../models/Note";
import { Folder, FolderSchema, NavigationNoteReference, NoteSchema } from "vnotes-types";

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

	const userFolders: FolderSchema[] = await FolderModel.find({ userSpaceId: userSpaceDoc._id })
		.sort({
			name: 1,
		})
		.select({ __v: 0 })
		.lean();

	const userNotes: Omit<NoteSchema, "content">[] = await NoteModel.find({
		userSpaceId: userSpaceDoc._id,
	})
		.sort({
			title: 1,
		})
		.select({ content: 0, __v: 0 })
		.lean();

	const folders: Folder[] = normaliseFolders(userFolders);
	console.log(folders);
	const notes: NavigationNoteReference[] = normaliseNotes(userNotes);
	const contentTree = createContentTree(folders, notes);
	return res.status(200).json({ contentTree });
}

function normaliseFolders(folders: FolderSchema[]): Folder[] {
	return folders.map((folder) => {
		const normalisedFolder: Folder = {
			...folder,
			_id: String(folder._id),
			parentId: folder.parentId ? String(folder.parentId) : undefined,
			numberOfItems: 0,
			content: { folders: [], notes: [] },
		};
		return normalisedFolder;
	});
}

function normaliseNotes(notes: Omit<NoteSchema, "content">[]): NavigationNoteReference[] {
	return notes.map((note) => {
		const normalisedNote: NavigationNoteReference = {
			...note,
			_id: String(note._id),
			parentId: note.parentId ? String(note.parentId) : undefined,
		};
		return normalisedNote;
	});
}

function createContentTree(folders: Folder[], notes: NavigationNoteReference[]) {
	const hashTable = Object.create(null);

	folders.forEach((folder) => (hashTable[folder._id] = folder));
	notes.forEach((note) => (hashTable[note._id] = note));

	const contentTree = { folders: [], notes: [] };
	folders.forEach((folder) => {
		if (folder.parentId) {
			hashTable[folder.parentId].content.folders.push(hashTable[folder._id]);
			(<Folder>hashTable[folder.parentId]).numberOfItems += 1;
		} else {
			//@ts-ignore
			contentTree.folders.push(hashTable[folder._id]);
		}
	});
	notes.forEach((note) => {
		if (note.parentId) {
			hashTable[note.parentId].content.notes.push(hashTable[note._id]);
			(<Folder>hashTable[note.parentId]).numberOfItems += 1;
		} else {
			//@ts-ignore
			contentTree.notes.push(hashTable[note._id]);
		}
	});
	return contentTree;
}

export const userSpaceController = { createUserSpace, deteleUserSpace, findAllUserSpaceContent };
