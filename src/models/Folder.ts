import { NoteModel } from "./Note";
import mongoose, { Schema } from "mongoose";
import { FolderSchema } from "vnotes-types";
import Logger from "../common/logger";

const folderSchema = new Schema<FolderSchema>({
	parentID: { type: mongoose.Types.ObjectId, required: false, ref: "Folder" },
	name: { type: String, required: true },
	createdTime: { type: String, required: true },
	lastUpdatedTime: { type: String, required: true },
});

/**
 * Checks if the folder has a name with a lengh of at least 1. If not, it assigns the
 *  predefined name "Untitled"
 */
folderSchema.pre("save", function (next) {
	if (!this.name.length) {
		this.name = "Untitled";
	}
	next();
});
/**
 * Hook executed prior to the removal of a folder.
 * Finds all Notes and Folders that have as their parentID the folder that is being removed
 * 	and removes them as well. Triggers this same hook for all the removed subfolders.
 */
//Pre hook to remove all notes and folders that reference to the deleted one
folderSchema.pre("remove", { document: true, query: false }, function (next) {
	const folderId = this._id;
	console.log(folderId);
	//TODO: Create better logger messages
	FolderModel.find({ parentID: folderId }).then((folders) => {
		folders.forEach((folder) => folder.remove().then((folder) => Logger.log(folder)));
	});
	NoteModel.find({ parentID: folderId }).then((notes) => {
		notes.forEach((note) => note.remove().then((note) => Logger.log(note)));
	});
	next();
});

export const FolderModel = mongoose.model<FolderSchema>("Folder", folderSchema);
