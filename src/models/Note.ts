import mongoose, { Schema } from "mongoose";
import { BlockSchema, BLOCK_TYPES, NoteSchema } from "vnotes-types";

const blockSchema = new Schema<BlockSchema>({
	blockID: { type: String, required: true, unique: true, index: 1 },
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
	noteID: { type: String, required: true, unique: true, index: 1 },
	parentID: { type: String, required: false },
	title: { type: String, required: true },
	createdTime: { type: String, required: true },
	lastUpdatedTime: { type: String, required: true },
	content: [blockSchema],
});

blockSchema.pre("validate", function (next) {
	if (this.type === "checkbox" && !Object.hasOwn(this.uniqueProperties, "selected")) {
		const error = new Error('"selected" property is required for checkbox blocks');
		next(error);
	}
	next();
});

export const NoteModel = mongoose.model<NoteSchema>("Note", noteSchema);
