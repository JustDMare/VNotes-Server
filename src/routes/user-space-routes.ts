import express from "express";
import { userSpaceController } from "../controllers/user-space-controller";

const router = express.Router();

router.post("/create", userSpaceController.createUserSpace);
router.delete("/delete", userSpaceController.deteleUserSpace);
router.get("/:locale", userSpaceController.findAllUserSpaceContent);

export default router;
