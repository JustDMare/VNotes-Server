import mongoose, { Schema } from "mongoose";
import { BlockSchema, BLOCK_TYPES, NoteSchema } from "vnotes-types";

const blockSchema = new Schema<BlockSchema>({
	blockID: mongoose.Types.ObjectId,
	parentID: { prop: mongoose.Types.ObjectId, ref: "Note" },
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
	noteID: mongoose.Types.ObjectId,
	parentID: { type: mongoose.Types.ObjectId, required: false },
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

export const NoteModel = mongoose.model("Note", noteSchema);
