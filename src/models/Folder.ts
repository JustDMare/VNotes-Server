import mongoose, { Schema } from "mongoose";
import { FolderSchema } from "vnotes-types";

const folderSchema = new Schema<FolderSchema>({
	folderID: mongoose.Types.ObjectId,
	parentID: { type: mongoose.Types.ObjectId, required: false },
	name: { type: String, required: true },
	createdTime: { type: String, required: true },
	lastUpdatedTime: { type: String, required: true },
});

export const FolderModel = mongoose.model("Folder", folderSchema);
