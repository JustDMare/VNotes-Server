import mongoose, { Schema } from "mongoose";
import { BlockSchema, BLOCK_TYPES, NoteSchema } from "vnotes-types";
import Logger from "../common/logger";

const blockSchema = new Schema<BlockSchema>({
	parentID: { type: String, required: true },
	type: { type: String, enum: BLOCK_TYPES, required: true },
	content: { type: String },
	uniqueProperties: {
		_id: false,
		type: { selected: { type: Boolean, required: false } },
		required: true,
	},
});

const noteSchema = new Schema<NoteSchema>({
	parentID: { type: String, required: false },
	title: { type: String, required: false },
	createdTime: { type: String, required: true },
	lastUpdatedTime: { type: String, required: true },
	content: { type: [blockSchema], index: 1 },
});

blockSchema.pre("save", function (next) {
	if (this.type === "checkbox" && this.uniqueProperties.selected === undefined) {
		const error = new Error('"selected" property is required for checkbox blocks');
		next(error);
	}
	next();
});
noteSchema.pre("save", function (next) {
	if (!this.title) {
		this.title = "Untitled";
	}
	next();
});

export const NoteModel = mongoose.model<NoteSchema>("Note", noteSchema);
