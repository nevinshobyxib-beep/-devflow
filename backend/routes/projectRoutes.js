const express = require("express");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");
const Activity = require("../models/Activity");

const router = express.Router();

router.post("/", authMiddleware, async (req, res,next) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
       userId: req.user.userId
    });
    await Activity.create({
  userId: req.user.userId,
  projectId: project._id,
  action: "PROJECT_CREATED",
  description: `Created project ${project.name}`
});

    res.status(201).json({
      message: "Project created successfully",
      project
    });
  } catch (error) {
    next(error);
  }
});
router.get("/", authMiddleware, async (req, res,next) => {
  try {
   const projects = await Project.find({
  userId: req.user.userId
});
    res.status(200).json({
      projects
    });
  } catch (error) {
    next(error);
  }
});
router.get("/:id", authMiddleware, async (req, res,next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.status(200).json({
      project
    });
  } catch (error) {
    next(error);
  }

});
router.put("/:id", authMiddleware, async (req, res,next) => {
  try {
    const { name, description } = req.body;

    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId
      },
      {
        name,
        description
      },
      {
        new: true
      }
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.status(200).json({
      message: "Project updated successfully",
      project
    });
  } catch (error) {
    next(error);
  }
});
router.delete("/:id", authMiddleware, async (req, res,next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }
    await Activity.create({
  userId: req.user.userId,
  projectId: project._id,
  action: "PROJECT_DELETED",
  description: `Deleted project ${project.name}`
});

    res.status(200).json({
      message: "Project deleted successfully"
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;