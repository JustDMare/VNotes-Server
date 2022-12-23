import mongoose, { Schema, model, connect } from "mongoose";
import { Block, BlockType, BlockUniqueProperties, BLOCK_TYPES } from "vnotes-types";
import { Note } from "vnotes-types";
/*
TODO: Maybe I can make the unique properties mandatory 
	and simply set it as false to avoid problems */
const blockUniquePropertiesSchema = new Schema<BlockUniqueProperties>({
	selected: { type: Boolean, required: false },
});

const blockSchema = new Schema<Block>({
	blockID: mongoose.Types.ObjectId,
	parentID: { prop: mongoose.Types.ObjectId, ref: "Note" },
	type: { type: String, enum: BLOCK_TYPES, required: true },
	createdTime: { type: String, required: true },
	lastUpdatedTime: { type: String, required: true },
	content: { type: String },
	uniqueProperties: { type: blockUniquePropertiesSchema, required: false },
});

const noteSchema = new Schema<Note>({
	noteID: mongoose.Types.ObjectId,
	parentID: mongoose.Types.ObjectId,
	title: { type: String, required: true },
	createdTime: { type: String, required: true },
	lastUpdatedTime: { type: String, required: true },
	content: [blockSchema],
});
