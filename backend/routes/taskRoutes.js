
const express = require("express");
const Task = require("../models/Task");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");
const ProjectMember = require("../models/ProjectMember");
const router = express.Router();
const Activity = require("../models/Activity");

// Create a task
router.post("/:projectId/tasks", authMiddleware, async (req, res, next) => {
  try {
    const { title, description, status, assignedTo } = req.body;

    const project = await Project.findOne({
      _id: req.params.projectId,
      userId: req.user.userId
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    if (assignedTo) {
      const member = await ProjectMember.findOne({
        projectId: req.params.projectId,
        userId: assignedTo
      });

      if (!member && project.userId.toString() !== assignedTo) {
        return res.status(400).json({
          message: "User is not a member of this project"
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      projectId: req.params.projectId,
      assignedTo
    });

    await task.populate("assignedTo", "name email");

    await Activity.create({
      userId: req.user.userId,
      projectId: req.params.projectId,
      action: "TASK_CREATED",
      description: `Created task ${title}`
    });

    res.status(201).json({
      message: "Task created successfully",
      task
    });
  } catch (error) {
    next(error);
  }
});

// Get all tasks of a project
router.get("/:projectId/tasks", authMiddleware, async (req, res, next) => {
  try {
    const { search, status } = req.query;

    const project = await Project.findOne({
      _id: req.params.projectId,
      userId: req.user.userId
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    const filter = {
      projectId: req.params.projectId
    };

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i"
      };
    }

    if (status) {
      filter.status = status;
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email");

    res.status(200).json({
      tasks
    });
  } catch (error) {
    next(error);
  }
});

// Get a single task
router.get("/tasks/:id", authMiddleware, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email");

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

    res.status(200).json({
      task
    });
  } catch (error) {
    next(error);
  }
});

// Update a task
// Update a task
router.put("/tasks/:id", authMiddleware, async (req, res, next) => {
  try {
    const { title, description, status, assignedTo } = req.body;

    const task = await Task.findById(req.params.id);

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

    if (assignedTo) {
      const member = await ProjectMember.findOne({
        projectId: task.projectId,
        userId: assignedTo
      });

      if (!member && project.userId.toString() !== assignedTo) {
        return res.status(400).json({
          message: "User is not a member of this project"
        });
      }

      task.assignedTo = assignedTo;
    } else {
      task.assignedTo = null;
    }

    task.title = title;
    task.description = description;
    task.status = status;

    await task.save();

    await task.populate("assignedTo", "name email");

    await Activity.create({
      userId: req.user.userId,
      projectId: task.projectId,
      action: "TASK_UPDATED",
      description: `Updated task ${task.title}`
    });

    res.status(200).json({
      message: "Task updated successfully",
      task
    });
  } catch (error) {
    next(error);
  }
});
// Delete a task
router.delete("/tasks/:id", authMiddleware, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

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

    await Task.findByIdAndDelete(req.params.id);

    await Activity.create({
      userId: req.user.userId,
      projectId: task.projectId,
      action: "TASK_DELETED",
      description: `Deleted task ${task.title}`
    });

    res.status(200).json({
      message: "Task deleted successfully"
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
