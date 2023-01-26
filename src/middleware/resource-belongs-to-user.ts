import { UserSpaceModel } from "./../models/UserSpace";
import { NextFunction } from "express";
import { NoteModel } from "../models/Note";
import { FolderModel } from "../models/Folder";

export async function checkNoteBelongsToUser(req, res, next) {
  const authSubject = req.auth?.payload.sub;
  const paramsNoteId = req.params?.id;
  const bodyNoteId = req?.body?._id;
  const bodyParentFolderId = req?.body?.parentId;
  console.log(authSubject, paramsNoteId, bodyNoteId, bodyParentFolderId);
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
async function noteBelongsToUser(noteId: string, authSubject: string) {
  const note = await NoteModel.findById(noteId);
  const userSpace = await UserSpaceModel.findOne({ authSubject: authSubject });
  console.log(userSpace);
  if (String(note?.userSpaceId) === String(userSpace?._id)) {
    return true;
  } else {
    return false;
  }
}

export async function checkFolderBelongsToUser(req, res, next) {
  const authSubject = req.auth?.payload.sub;
  const paramsFolderId = req.params?.id;
  const bodyFolderId = req?.body?._id;
  const bodyParentFolderId = req?.body?.parentId;
  console.log(authSubject, paramsFolderId, bodyFolderId, bodyParentFolderId);
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

async function folderBelongsToUser(folderId: string, authSubject: string) {
  const folder = await FolderModel.findById(folderId);
  const userSpace = await UserSpaceModel.findOne({ authSubject });
  if (String(folder?.userSpaceId) === String(userSpace?._id.toString())) {
    return true;
  } else {
    return false;
  }
}
