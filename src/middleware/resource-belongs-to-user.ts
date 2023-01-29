import { UserSpaceModel } from "./../models/UserSpace";
import { NextFunction } from "express";
import { NoteModel } from "../models/Note";
import { FolderModel } from "../models/Folder";

/**
 * Middleware for the note routes that checks up to 3 things, depending on the route or
 * body params provided when calling the endpoint:
 * 1. If the note whose `_id` is in `req.params.id` belongs to the user.
 * 2. If the note whose `_id` is in `req.body._id` belongs to the user.
 * 3. If the folder whose `_id` is in `req.body.parentId` belongs to the user.
 *
 * This is done by checking if the `_id` of the UserSpace that belongs to the auth `sub`
 * provided by the auth0 access token matches the `userSpaceId` of the note.
 *
 * @param {Request} req - Request object. Not using its type because of TS errors.
 * @param {Response} res - Response object. Not using its type because of TS errors.
 * @param {NextFunction} next - next function. Not using its type because of TS errors.
 */
export async function checkNoteBelongsToUser(req, res, next): Promise<void> {
  const authSubject = req.auth?.payload.sub;
  const paramsNoteId = req.params?.id;
  const bodyNoteId = req?.body?._id;
  const bodyParentFolderId = req?.body?.parentId;
  if (paramsNoteId) {
    const belongsToUser = await noteBelongsToUser(paramsNoteId, authSubject);
    if (!belongsToUser) {
      return res.status(401).json({ message: "This note cannot be accessed by this user" });
    }
  }
  if (bodyNoteId) {
    const belongsToUser = await noteBelongsToUser(bodyNoteId, authSubject);
    if (!belongsToUser) {
      return res.status(401).json({ message: "This note cannot be accessed by this user" });
    }
  }
  if (bodyParentFolderId) {
    const belongsToUser = await folderBelongsToUser(bodyParentFolderId, authSubject);
    if (!belongsToUser) {
      return res.status(401).json({ message: "This folder cannot be accessed by this user" });
    }
  }
  next();
}
/**
 * Checks if the `_id` of the UserSpace that belongs to the provided `authSubject` matches
 * the `userSpaceId` of the note  represented by `noteId`. This proves that the note
 * belongs to the user.
 *
 * @param noteId `_id` of the note to check.
 * @param authSubject - auth `sub` of the user to check.
 * @returns boolean - true if the note belongs to the user, false otherwise.
 */
async function noteBelongsToUser(noteId: string, authSubject: string): Promise<boolean> {
  const note = await NoteModel.findById(noteId);
  const userSpace = await UserSpaceModel.findOne({ authSubject: authSubject });
  console.log(userSpace);
  if (String(note?.userSpaceId) === String(userSpace?._id)) {
    return true;
  } else {
    return false;
  }
}

/**
 * Middleware for the folder routes that checks up to 3 things, depending on the route or
 * body params provided when calling the endpoint:
 * 1. If the folder whose `_id` is in `req.params.id` belongs to the user.
 * 2. If the folder whose `_id` is in `req.body._id` belongs to the user.
 * 3. If the folder whose `_id` is in `req.body.parentId` belongs to the user.
 *
 * This is done by checking if the `_id` of the UserSpace that belongs to the auth `sub`
 * provided by the auth0 access token matches the `userSpaceId` of the folder.
 *
 * @param {Request} req - Request object. Not using its type because of TS errors.
 * @param {Response} res - Response object. Not using its type because of TS errors.
 * @param {NextFunction} next - next function. Not using its type because of TS errors.
 */
export async function checkFolderBelongsToUser(req, res, next): Promise<void> {
  const authSubject = req.auth?.payload.sub;
  const paramsFolderId = req.params?.id;
  const bodyFolderId = req?.body?._id;
  const bodyParentFolderId = req?.body?.parentId;
  if (paramsFolderId) {
    const belongsToUser = await folderBelongsToUser(paramsFolderId, authSubject);
    if (!belongsToUser) {
      return res.status(401).json({ message: "This folder cannot be accessed by this user" });
    }
  }
  if (bodyFolderId) {
    const belongsToUser = await folderBelongsToUser(bodyFolderId, authSubject);
    if (!belongsToUser) {
      return res.status(401).json({ message: "This folder cannot be accessed by this user" });
    }
  }
  if (bodyParentFolderId) {
    const belongsToUser = await folderBelongsToUser(bodyParentFolderId, authSubject);
    if (!belongsToUser) {
      return res.status(401).json({ message: "This folder cannot be accessed by this user" });
    }
  }
  next();
}

/**
 * Checks if the `_id` of the UserSpace that belongs to the provided `authSubject` matches
 * the `userSpaceId` of the folder represented by `folderId`. This proves that the folder
 * belongs to the user.
 *
 * @param folderId `_id` of the folder to check.
 * @param authSubject - auth `sub` of the user to check.
 * @returns boolean - true if the folder belongs to the user, false otherwise.
 */
async function folderBelongsToUser(folderId: string, authSubject: string): Promise<boolean> {
  const folder = await FolderModel.findById(folderId);
  const userSpace = await UserSpaceModel.findOne({ authSubject });
  if (String(folder?.userSpaceId) === String(userSpace?._id.toString())) {
    return true;
  } else {
    return false;
  }
}
