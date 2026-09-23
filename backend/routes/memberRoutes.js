const express = require("express");
const ProjectMember = require("../models/ProjectMember");
const Project = require("../models/Project");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const Activity = require("../models/Activity");

const router = express.Router();

// Add a member to a project
router.post("/:projectId/members", authMiddleware, async (req, res, next) => {
  try {
    const { email } = req.body;
console.log("Member email received:", email);
    const normalizedEmail = email.trim().toLowerCase();

    const project = await Project.findOne({
      _id: req.params.projectId,
      userId: req.user.userId
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const existingMember = await ProjectMember.findOne({
      projectId: req.params.projectId,
      userId: user._id
    });

    if (existingMember) {
      return res.status(400).json({
        message: "User is already a member"
      });
    }

    const member = await ProjectMember.create({
      projectId: req.params.projectId,
      userId: user._id,
      role: "Member"
    });

    await Activity.create({
      userId: req.user.userId,
      projectId: req.params.projectId,
      action: "MEMBER_ADDED",
      description: `Added member ${user.name}`
    });

    res.status(201).json({
      message: "Member added successfully",
      member
    });
  } catch (error) {
    next(error);
  }
});

// Get all members of a project
router.get("/:projectId/members", authMiddleware, async (req, res, next) => {
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

    const members = await ProjectMember.find({
      projectId: req.params.projectId
    }).populate("userId", "name email");

    res.status(200).json({
      members
    });
  } catch (error) {
    next(error);
  }
});

// Remove a member from a project
router.delete(
  "/:projectId/members/:userId",
  authMiddleware,
  async (req, res, next) => {
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

      const user = await User.findById(req.params.userId);

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      const member = await ProjectMember.findOneAndDelete({
        projectId: req.params.projectId,
        userId: req.params.userId
      });

      if (!member) {
        return res.status(404).json({
          message: "Member not found"
        });
      }

      await Activity.create({
        userId: req.user.userId,
        projectId: req.params.projectId,
        action: "MEMBER_REMOVED",
        description: `Removed member ${user.name}`
      });

      res.status(200).json({
        message: "Member removed successfully"
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;