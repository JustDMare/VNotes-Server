import mongoose, { Schema } from "mongoose";
import { FolderSchema } from "vnotes-types";

const folderSchema = new Schema<FolderSchema>({
	folderID: { type: String, required: true, unique: true, index: 1 },
	parentID: { type: String, required: false },
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

export const FolderModel = mongoose.model<FolderSchema>("Folder", folderSchema);
