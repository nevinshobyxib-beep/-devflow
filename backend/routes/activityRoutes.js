const express = require("express");
const Activity = require("../models/Activity");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all activities of a project
router.get("/:projectId/activities", authMiddleware, async (req, res,next) => {
  try {

    const project = await Project.findOne({
      _id: req.params.projectId,
      userId: req.user.userId
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    const activities = await Activity.find({
      projectId: req.params.projectId
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      activities
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;