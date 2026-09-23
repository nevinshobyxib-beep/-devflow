const express = require("express");
const Project = require("../models/Project");
const Task = require("../models/Task");
const ProjectMember = require("../models/ProjectMember");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/stats", authMiddleware, async (req, res,next) => {
  try {
    const projects = await Project.find({
      userId: req.user.userId
    });

    const projectIds = projects.map(project => project._id);

    const totalProjects = projects.length;

    const totalTasks = await Task.countDocuments({
      projectId: { $in: projectIds }
    });

    const completedTasks = await Task.countDocuments({
      projectId: { $in: projectIds },
      status: "Completed"
    });

    const pendingTasks = totalTasks - completedTasks;

    const totalMembers = await ProjectMember.countDocuments({
      projectId: { $in: projectIds }
    });

    res.status(200).json({
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      totalMembers
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;