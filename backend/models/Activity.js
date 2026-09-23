const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },

  action: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  }

}, {
  timestamps: true
});

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;