const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({

  text: {
    type: String,
    required: true
  },

  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;