const mongoose = require("mongoose");

const projectMemberSchema = new mongoose.Schema({

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  role: {
    type: String,
    default: "Member"
  }

});

const ProjectMember = mongoose.model(
  "ProjectMember",
  projectMemberSchema
);

module.exports = ProjectMember;