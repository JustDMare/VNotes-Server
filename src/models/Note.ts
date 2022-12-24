import mongoose, { Schema, model, connect } from "mongoose";
import { Block, BlockType, BlockUniqueProperties, BLOCK_TYPES } from "vnotes-types";
import { Note } from "vnotes-types";

const blockSchema = new Schema<Block>({
	blockID: mongoose.Types.ObjectId,
	parentID: { prop: mongoose.Types.ObjectId, ref: "Note" },
	type: { type: String, enum: BLOCK_TYPES, required: true },
	createdTime: { type: String, required: true },
	lastUpdatedTime: { type: String, required: true },
	content: { type: String },
	uniqueProperties: {
		type: { selected: { type: Boolean, required: isSelectedRequired, default: false } },
		required: isSelectedRequired,
	},
});

const noteSchema = new Schema<Note>({
	noteID: mongoose.Types.ObjectId,
	parentID: mongoose.Types.ObjectId,
	title: { type: String, required: true },
	createdTime: { type: String, required: true },
	lastUpdatedTime: { type: String, required: true },
	content: [blockSchema],
});

function isSelectedRequired(this: Block) {
	if (this.type === "checkbox") {
		return true;
	}
	return false;
}
