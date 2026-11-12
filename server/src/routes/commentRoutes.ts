import { Router } from "express";
import {
  createCommentController,
  deleteCommentController,
  getCommentController,
  listCommentsController,
  updateCommentController,
} from "../controllers/commentController";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router({ mergeParams: true });

router.use(asyncHandler(requireAuth));

router.get("/", asyncHandler(listCommentsController));
router.post("/", asyncHandler(createCommentController));
router.get("/:commentId", asyncHandler(getCommentController));
router.patch("/:commentId", asyncHandler(updateCommentController));
router.delete("/:commentId", asyncHandler(deleteCommentController));

export default router;
