import mongoose, { Schema } from "mongoose";
import { UserSpaceSchema } from "vnotes-types";

const userSpaceSchema = new Schema<UserSpaceSchema>({
	userSpaceID: mongoose.Types.ObjectId,
});

export const UserSpaceModel = mongoose.model<UserSpaceSchema>("User_Space", userSpaceSchema);
