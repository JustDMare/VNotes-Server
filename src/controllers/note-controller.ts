import { NextFunction, Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { NoteModel } from "../models/Note";
import { UserSpaceModel } from "../models/UserSpace";
import { checkFolderExists, checkValidObjetId } from "./common-helpers";

/**
 * Retrieves the note whose `_id` matches the `id` given as a parameter.
 * @returns note whose `_id` matches the `id` given as a parameter.
 */
async function findNote(req: Request, res: Response, next: NextFunction) {
  const noteId = req.params.id;
  try {
    checkValidObjetId(noteId);
  } catch (error) {
    return res.status(400).json({ error: (<Error>error).message });
  }
  try {
    const note = await NoteModel.findById(req.params.id);
    if (!note) {
      return res.status(404).json("Note not found");
    }
    return res.status(201).json({ note });
  } catch (error) {
    res.status(500).json({ error: (<Error>error).message });
  }
}

/**
 * Creates a note with the  `title` and `parentId` provided in `req.body`.
 *  Then it returns the newly created note.
 *
 * @returns The newly created note
 */
async function createNote(req: Request, res: Response, next: NextFunction) {
  const { title, parentId } = req.body;
  const authSubject = req.auth?.payload.sub;

  const userSpace = await UserSpaceModel.findOne({ authSubject });
  if (!userSpace) {
    return res.status(404).json({ message: `User space for this user has been not found` });
  }
  const userSpaceId = userSpace?._id;

  const note = new NoteModel({
    parentId: null,
    userSpaceId,
    title,
    createdTime: Date.now().toString(),
    lastUpdatedTime: Date.now().toString(),
    content: [],
  });
  if (parentId && parentId.length) {
    try {
      await checkFolderExists(parentId);
    } catch (error) {
      return res.status(400).json({ error: (<Error>error).message });
    }
    note.parentId = new mongoose.Types.ObjectId(parentId);
  }

  return note
    .save()
    .then((note) => res.status(201).json({ note, message: "Note created" }))
    .catch((error) => res.status(500).json({ error: error.message }));
}

/**
 * Deletes the note that matches the `_id` in `req.params`.
 * 	Then returns the deleted note if any. Otherwise it returns an error.
 *
 * @returns The deleted note.
 */
function deleteNote(req: Request, res: Response, next: NextFunction) {
  const noteId = req.params.id;
  try {
    checkValidObjetId(noteId);
  } catch (error) {
    return res.status(400).json({ error: (<Error>error).message });
  }

  return NoteModel.findOneAndDelete({ _id: noteId })
    .then((note) =>
      note
        ? res.status(201).json({ note, message: "Note deleted" })
        : res.status(404).json({ message: `Note with _id '${noteId}' not found` })
    )
    .catch((error) => res.status(500).json({ error: error.message }));
}
/**
 * Overwrites the `content` of the note matching the  `_id`. Both fields provided in
 * 	`req.body`. Then it returns the updated note.
 *  Returns an error if no note matching the provided  `_id` is found.
 *
 * @returns The updated note.
 */
function updateNoteContent(req: Request, res: Response, next: NextFunction) {
  const { _id, title, content } = req.body;
  console.log(_id);
  try {
    checkValidObjetId(_id);
  } catch (error) {
    return res.status(400).json({ error: (<Error>error).message });
  }

  return NoteModel.findById(_id).then((note) => {
    if (note) {
      note.title = title;
      note.content = content;
      note.lastUpdatedTime = Date.now().toString();

      note
        .save()
        .then((note) =>
          note
            ? res.status(201).json({ note, message: "Note updated" })
            : res.status(404).json({ message: `Note with _id '${_id}' not found` })
        )
        .catch((error) => res.status(500).json({ error: error.message }));
    }
  });
}

/**
 * Updates the `title` of the folder matching the `_id`. Both fields provided in
 * 	`req.body`. Then it returns the updated note.
 *  Returns an error if no note matching the provided `_id` is found.
 *
 * @returns The updated note.
 */
function updateNoteTitle(req: Request, res: Response, next: NextFunction) {
  const { _id, title } = req.body;

  try {
    checkValidObjetId(_id);
  } catch (error) {
    return res.status(400).json({ error: (<Error>error).message });
  }

  return NoteModel.findOneAndUpdate(
    { _id: _id },
    {
      title,
      lastUpdatedTime: Date.now().toString(),
    },
    { new: true }
  )
    .then((note) =>
      note
        ? res.status(201).json({ note, message: "Note title updated" })
        : res.status(404).json({ message: `Note with _id '${_id}' not found` })
    )
    .catch((error) => res.status(500).json({ error: error.message }));
}

/**
 * Updates the `parentId` of the note matching the `_id`. Both fields provided in
 * 	`req.body`. Then it returns the updated note.
 *  Returns an error if no folder matching the provided `_id` is found, if the common
 * 		checks fail or if the `parentId` and `_id` contain the same value.
 *
 *
 * @returns The updated note.
 */
async function updateNoteParentId(req: Request, res: Response, next: NextFunction) {
  const { _id, parentId } = req.body;
  let parentObjectId: Types.ObjectId | null = null;

  if (parentId === _id) {
    return res.status(400).json({ message: "A Note cannot be its own parent" });
  }

  if (parentId && parentId.length) {
    try {
      checkValidObjetId(_id);
      await checkFolderExists(parentId);
    } catch (error) {
      return res.status(400).json({ error: (<Error>error).message });
    }
    parentObjectId = new mongoose.Types.ObjectId(parentId);
  }

  return NoteModel.findOneAndUpdate(
    { _id: _id },
    {
      parentId: parentObjectId,
      lastUpdatedTime: Date.now().toString(),
    },
    { new: true }
  )
    .then((note) =>
      note
        ? res.status(201).json({ note, message: "Note moved" })
        : res.status(404).json({ message: `Note with _id '${_id}' not found` })
    )
    .catch((error) => res.status(500).json({ error: error.message }));
}

export const noteController = {
  findNote,
  createNote,
  deleteNote,
  updateNoteContent,
  updateNoteTitle,
  updateNoteParentId,
};
