import mongoose, { Schema } from "mongoose";
import { BlockSchema, BLOCK_TYPES, NoteSchema } from "vnotes-types";

const blockSchema = new Schema<BlockSchema>({
	parentID: { type: String, required: true },
	type: { type: String, enum: BLOCK_TYPES, required: true },
	createdTime: { type: String, required: true },
	lastUpdatedTime: { type: String, required: true },
	content: { type: String },
	uniqueProperties: {
		type: { selected: { type: Boolean, required: false, default: false } },
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

blockSchema.pre("validate", function (next) {
	if (this.type === "checkbox" && !Object.hasOwn(this.uniqueProperties, "selected")) {
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
