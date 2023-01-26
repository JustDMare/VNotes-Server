import mongoose, { Schema } from "mongoose";
import { UserSpaceSchema } from "vnotes-types";

const userSpaceSchema = new Schema<UserSpaceSchema>({
  authSubject: { type: String, required: true, unique: true, index: 1 },
});

export const UserSpaceModel = mongoose.model<UserSpaceSchema>("User_Space", userSpaceSchema);
