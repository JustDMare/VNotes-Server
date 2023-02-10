import { auth } from "express-oauth2-jwt-bearer";
import { NoteModel } from "./Note";
import mongoose, { Schema } from "mongoose";
import { FolderSchema } from "vnotes-types";
import Logger from "../common/logger";

const folderSchema = new Schema<FolderSchema>({
  parentId: { type: mongoose.Types.ObjectId, required: false, ref: "Folder" },
  userSpaceId: { type: mongoose.Types.ObjectId, required: true, ref: "User_Space" },
  name: { type: String, required: true },
  createdTime: { type: String, required: true },
  lastUpdatedTime: { type: String, required: true },
});

/**
 * Checks if the folder has a name with a lengh of at least 1. If not, it assigns the
 *  predefined name "Untitled"
 */
folderSchema.pre("save", function (next) {
  if (!this.name.length) {
    this.name = "Untitled";
  }
  next();
});

/**
 * Hook executed prior to the removal of a folder. Finds all Notes and Folders that have
 * as their parentId the folder that is being removed and removes them as well. Triggers
 * this same hook for all the removed subfolders.
 *
 * Important to note that the `await` on `remove()` and `Promise.all` are necessary to ensure that
 * the hook is executed for all the subfolders and subnotes *before* the parent folder is
 * removed. Otherwise, only the first level items would be removed.
 */
//TODO: Add error handling in case a child could not be removed?
folderSchema.pre("remove", { document: true, query: false }, async function (next) {
  const folderId = this._id;
  const childNotes = await NoteModel.find({ parentId: folderId });
  const childFolders = await FolderModel.find({ parentId: folderId });
  await Promise.all(
    childNotes.map(async (note) => {
      await note.remove();
      Logger.log(`[CASCADE DELETE] - Deleted note: ${note._id}`);
    })
  );
  await Promise.all(
    childFolders.map(async (folder) => {
      await folder.remove();
      Logger.log(`[CASCADE DELETE] - Deleted folder: ${folder._id}`);
    })
  );
  next();
});

export const FolderModel = mongoose.model<FolderSchema>("Folder", folderSchema);
