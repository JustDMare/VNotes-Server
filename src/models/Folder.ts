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

folderSchema.pre("save", function (next) {
	if (!this.name.length) {
		this.name = "Untitled";
	}
	next();
});
//TODO: Change all .then() by await for cleaner code?
//Pre hook to remove all notes and folders that reference to the deleted one
folderSchema.pre("remove", { document: true, query: false }, function (next) {
	const folderId = this._id;
	console.log(folderId);
	FolderModel.find({ parentID: folderId }).then((folders) => {
		folders.forEach((folder) => folder.remove().then((folder) => Logger.log(folder)));
	});
	NoteModel.find({ parentID: folderId }).then((notes) => {
		notes.forEach((note) => note.remove().then((note) => Logger.log(note)));
	});
	next();
});

export const FolderModel = mongoose.model<FolderSchema>("Folder", folderSchema);
