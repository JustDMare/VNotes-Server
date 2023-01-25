import express from "express";
import { userSpaceController } from "../controllers/user-space-controller";
import { checkJwt } from "../server";

const router = express.Router();

router.post("/create", checkJwt, userSpaceController.createUserSpace);
router.delete("/delete/:id", checkJwt, userSpaceController.deteleUserSpace);
router.get("/:token", checkJwt, userSpaceController.findAllUserSpaceContent);

export default router;
