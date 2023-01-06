import express from "express";
import { userSpaceController } from "../controllers/user-space-controller";

const router = express.Router();

router.post("/create", userSpaceController.createUserSpace);
router.delete("/delete/:id", userSpaceController.deteleUserSpace);
router.get("/:token", userSpaceController.findAllUserSpaceContent);

export default router;
