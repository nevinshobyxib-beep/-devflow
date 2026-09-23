const express = require("express");
const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");
const Activity = require("../models/Activity");

const router = express.Router();

// Create a comment
router.post("/tasks/:taskId/comments", authMiddleware, async (req, res,next) => {
  try {
    const { text } = req.body;

    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const project = await Project.findOne({
      _id: task.projectId,
      userId: req.user.userId
    });

    if (!project) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const comment = await Comment.create({
      text,
      taskId: req.params.taskId,
      userId: req.user.userId
    });
    await Activity.create({
  userId: req.user.userId,
  projectId: task.projectId,
  action: "COMMENT_CREATED",
  description: `Commented on task ${task.title}`
});

    res.status(201).json({
      message: "Comment created successfully",
      comment
    });

  } catch (error) {
    next(error);
  }
});
// Get all comments of a task
router.get("/tasks/:taskId/comments", authMiddleware, async (req, res,next) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const project = await Project.findOne({
      _id: task.projectId,
      userId: req.user.userId
    });

    if (!project) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const comments = await Comment.find({
      taskId: req.params.taskId
    }).populate("userId", "name email");

    res.status(200).json({
      comments
    });

  } catch (error) {
    next(error);
  }
});
// Delete a comment
router.delete("/comments/:id", authMiddleware, async (req, res,next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }

    if (comment.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only delete your own comments"
      });
    }
    const task = await Task.findById(comment.taskId);

if (!task) {
  return res.status(404).json({
    message: "Task not found"
  });
}

    await Comment.findByIdAndDelete(req.params.id);
    await Activity.create({
  userId: req.user.userId,
  projectId: task.projectId,
  action: "COMMENT_DELETED",
  description: `Deleted comment from task ${task.title}`
});

    res.status(200).json({
      message: "Comment deleted successfully"
    });

  } catch (error) {
    next(error);
  }
});
module.exports = router;