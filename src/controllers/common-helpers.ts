import { isValidObjectId } from "mongoose";
import Logger from "../common/logger";
import { FolderModel } from "../models/Folder";

/**
 * Helper function used to check if a folder with an `_id` equal to the given `folderId` exists in the database
 *  when assigning it as a parent of another folder. It also checks if the given `folderId` is a valid ObjectId.
 *
 * @param {string} folderId `_id` of the folder to find.
 * @throws Error if `folderId` is not a valid ObjectId.
 * @throws Error if no folder is found.
 */
export async function checkFolderExists(folderId: string) {
	//TODO: Cambiar para que devuelva un res.status en vez de error?
	checkValidObjetId(folderId);
	try {
		const folder = await FolderModel.findOne({ _id: folderId });
		if (!folder) {
			throw new Error(`Folder with _id '${folderId}' does not exist`);
		}
	} catch (error) {
		Logger.error(error);
		throw new Error(
			`Error while searching for folder with _id '${folderId}: ${(<Error>error).message}`
		);
	}
}

/**
 * Helper function that checks if the `id` passed as a parameter is a valid ObjectId
 *
 * @param {string} id to check if it is a valid ObjectId.
 * @throws error if `id` is not a valid ObjectId
 */
export function checkValidObjetId(id: string) {
	if (!isValidObjectId(id)) {
		throw new Error(`Wrong format for _id '${id}'. Can't be converted to ObjectId`);
	}
}
