import mongoose, { Schema } from "mongoose";
import { BlockSchema, BLOCK_TYPES, NoteSchema } from "vnotes-types";

const blockSchema = new Schema<BlockSchema>({
	type: { type: String, enum: BLOCK_TYPES, required: true },
	content: { type: String },
	uniqueProperties: {
		_id: false,
		type: { selected: { type: Boolean, required: false } },
		required: true,
	},
});

const noteSchema = new Schema<NoteSchema>({
	parentId: { type: mongoose.Types.ObjectId, required: false, ref: "Folder" },
	title: { type: String, required: false },
	createdTime: { type: String, required: true },
	lastUpdatedTime: { type: String, required: true },
	content: { type: [blockSchema], index: 1 },
});

/**
 * Checks if the `type` of the block is `checkbox` and if that is the case,
 * checks if a `selected` property exists in the block's `uniqueProperties`.
 * If it does not exits, raises an error.
 */
blockSchema.pre("save", function (next) {
	if (this.type === "checkbox" && this.uniqueProperties.selected === undefined) {
		const error = new Error('"selected" property is required for checkbox blocks');
		next(error);
	}
	next();
});

/**
 * Checks if the note has a title with a lengh of at least 1. If not, it assigns the
 *  predefined title "Untitled"
 */
noteSchema.pre("save", function (next) {
	if (!this.title.length) {
		this.title = "Untitled";
	}
	next();
});

export const NoteModel = mongoose.model<NoteSchema>("Note", noteSchema);
