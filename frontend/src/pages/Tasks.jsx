import { useEffect, useState } from "react";

import { getProjects } from "../services/projectService";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";

import { getProjectMembers } from "../services/memberService";

import {
  getComments,
  createComment,
  deleteComment,
} from "../services/commentService";

import "./Tasks.css";

const Tasks = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Todo");
  const [assignedTo, setAssignedTo] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [editingTaskId, setEditingTaskId] = useState(null);

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [saving, setSaving] = useState(false);

  const [openComments, setOpenComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [addingComment, setAddingComment] = useState({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const result = await getProjects();

        if (result.response.ok) {
          setProjects(result.data.projects);

          if (result.data.projects.length > 0) {
            setSelectedProjectId(result.data.projects[0]._id);
          }
        }
      } catch (error) {
        console.log("Failed to fetch projects", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!selectedProjectId) {
        return;
      }

      try {
        setLoadingMembers(true);

        const result = await getProjectMembers(
          selectedProjectId
        );

        if (result.response.ok) {
          setMembers(result.data.members);
        }
      } catch (error) {
        console.log("Failed to fetch project members", error);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [selectedProjectId]);

  const fetchTasks = async () => {
    if (!selectedProjectId) {
      return;
    }

    try {
      setLoadingTasks(true);

      const result = await getTasks(
        selectedProjectId,
        search,
        filterStatus
      );

      if (result.response.ok) {
        setTasks(result.data.tasks);
      }
    } catch (error) {
      console.log("Failed to fetch tasks", error);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedProjectId, search, filterStatus]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      setSaving(true);

      if (editingTaskId) {
        const result = await updateTask(editingTaskId, {
          title,
          description,
          status,
          assignedTo: assignedTo || undefined,
        });

        if (result.response.ok) {
          setTasks((currentTasks) =>
            currentTasks.map((task) =>
              task._id === editingTaskId
                ? result.data.task
                : task
            )
          );

          setTitle("");
          setDescription("");
          setStatus("Todo");
          setAssignedTo("");
          setEditingTaskId(null);
        }
      } else {
        const result = await createTask(
          selectedProjectId,
          {
            title,
            description,
            status,
            assignedTo: assignedTo || undefined,
          }
        );

        if (result.response.ok) {
          setTasks((currentTasks) => [
            result.data.task,
            ...currentTasks,
          ]);

          setTitle("");
          setDescription("");
          setStatus("Todo");
          setAssignedTo("");
        }
      }
    } catch (error) {
      console.log("Failed to save task", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (task) => {
    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status);
    setAssignedTo(task.assignedTo?._id || "");
    setEditingTaskId(task._id);
  };

  const handleDelete = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await deleteTask(taskId);

      if (result.response.ok) {
        setTasks((currentTasks) =>
          currentTasks.filter(
            (task) => task._id !== taskId
          )
        );

        setComments((currentComments) => {
          const updatedComments = {
            ...currentComments,
          };

          delete updatedComments[taskId];

          return updatedComments;
        });
      }
    } catch (error) {
      console.log("Failed to delete task", error);
    }
  };

  const handleCancelEdit = () => {
    setTitle("");
    setDescription("");
    setStatus("Todo");
    setAssignedTo("");
    setEditingTaskId(null);
  };

  const handleToggleComments = async (taskId) => {
    const isOpen = openComments[taskId];

    setOpenComments((current) => ({
      ...current,
      [taskId]: !isOpen,
    }));

    if (!isOpen && !comments[taskId]) {
      try {
        setLoadingComments((current) => ({
          ...current,
          [taskId]: true,
        }));

        const result = await getComments(taskId);

        if (result.response.ok) {
          setComments((current) => ({
            ...current,
            [taskId]: result.data.comments,
          }));
        }
      } catch (error) {
        console.log("Failed to fetch comments", error);
      } finally {
        setLoadingComments((current) => ({
          ...current,
          [taskId]: false,
        }));
      }
    }
  };

  const handleAddComment = async (taskId) => {
    const text = commentText[taskId] || "";

    if (!text.trim()) {
      return;
    }

    try {
      setAddingComment((current) => ({
        ...current,
        [taskId]: true,
      }));

      const result = await createComment(
        taskId,
        text
      );

      if (result.response.ok) {
        const commentResult = await getComments(
          taskId
        );

        if (commentResult.response.ok) {
          setComments((current) => ({
            ...current,
            [taskId]: commentResult.data.comments,
          }));
        }

        setCommentText((current) => ({
          ...current,
          [taskId]: "",
        }));
      }
    } catch (error) {
      console.log("Failed to create comment", error);
    } finally {
      setAddingComment((current) => ({
        ...current,
        [taskId]: false,
      }));
    }
  };

  const handleDeleteComment = async (
    taskId,
    commentId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await deleteComment(commentId);

      if (result.response.ok) {
        setComments((current) => ({
          ...current,
          [taskId]: current[taskId].filter(
            (comment) => comment._id !== commentId
          ),
        }));
      }
    } catch (error) {
      console.log("Failed to delete comment", error);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setFilterStatus("");
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <h1>Tasks</h1>
          <p>Manage tasks across your projects.</p>
        </div>
      </div>

      <div className="task-project-selector">
        <label>Select Project</label>

        {loadingProjects ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p>No projects available.</p>
        ) : (
          <select
            value={selectedProjectId}
            onChange={(event) =>
              setSelectedProjectId(event.target.value)
            }
          >
            {projects.map((project) => (
              <option
                key={project._id}
                value={project._id}
              >
                {project.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedProjectId && (
        <>
          <div className="create-task-card">
            <h2>
              {editingTaskId
                ? "Edit Task"
                : "Create Task"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Task Title</label>

                <input
                  type="text"
                  placeholder="Enter task title"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  placeholder="Enter task description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Status</label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                >
                  <option value="Todo">
                    Todo
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Completed">
                    Completed
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Assign To</label>

                {loadingMembers ? (
                  <p className="members-loading">
                    Loading members...
                  </p>
                ) : (
                  <select
                    value={assignedTo}
                    onChange={(event) =>
                      setAssignedTo(event.target.value)
                    }
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {members.map((member) => (
                      <option
                        key={member.userId._id}
                        value={member.userId._id}
                      >
                        {member.userId.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="task-form-buttons">
                <button
                  type="submit"
                  className="create-task-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingTaskId
                    ? "Update Task"
                    : "Create Task"}
                </button>

                {editingTaskId && (
                  <button
                    type="button"
                    className="cancel-task-button"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="task-filters">
            <div className="form-group">
              <label>Search Tasks</label>

              <input
                type="text"
                placeholder="Search by task title"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Filter by Status</label>

              <select
                value={filterStatus}
                onChange={(event) =>
                  setFilterStatus(event.target.value)
                }
              >
                <option value="">
                  All Statuses
                </option>

                <option value="Todo">
                  Todo
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Completed">
                  Completed
                </option>
              </select>
            </div>

            <button
              type="button"
              className="clear-filters-button"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </div>

          <div className="tasks-section">
            <div className="tasks-section-header">
              <h2>Project Tasks</h2>

              {!loadingTasks && (
                <span className="task-count">
                  {tasks.length}{" "}
                  {tasks.length === 1
                    ? "task"
                    : "tasks"}
                </span>
              )}
            </div>

            {loadingTasks ? (
              <p className="tasks-message">
                Loading tasks...
              </p>
            ) : tasks.length === 0 ? (
              <p className="tasks-message">
                No tasks found for this project.
              </p>
            ) : (
              <div className="tasks-grid">
                {tasks.map((task) => (
                  <div
                    className="task-card"
                    key={task._id}
                  >
                    <h3>{task.title}</h3>

                    <p>
                      {task.description ||
                        "No description provided."}
                    </p>

                    <span className="task-status">
                      {task.status}
                    </span>

                    <div className="task-assigned">
                      <span>Assigned to:</span>

                      <strong>
                        {task.assignedTo
                          ? task.assignedTo.name
                          : "Unassigned"}
                      </strong>
                    </div>

                    <div className="task-actions">
                      <button
                        className="edit-task-button"
                        onClick={() =>
                          handleEdit(task)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-task-button"
                        onClick={() =>
                          handleDelete(task._id)
                        }
                      >
                        Delete
                      </button>

                      <button
                        className="comments-button"
                        onClick={() =>
                          handleToggleComments(
                            task._id
                          )
                        }
                      >
                        {openComments[task._id]
                          ? "Hide Comments"
                          : "Comments"}
                      </button>
                    </div>

                    {openComments[task._id] && (
                      <div className="comments-section">
                        <h4>Comments</h4>

                        {loadingComments[
                          task._id
                        ] ? (
                          <p className="comments-message">
                            Loading comments...
                          </p>
                        ) : comments[task._id]
                            ?.length === 0 ? (
                          <p className="comments-message">
                            No comments yet.
                          </p>
                        ) : (
                          <div className="comments-list">
                            {comments[
                              task._id
                            ]?.map((comment) => (
                              <div
                                className="comment-item"
                                key={comment._id}
                              >
                                <div className="comment-content">
                                  <strong>
                                    {comment.userId
                                      ?.name ||
                                      "User"}
                                  </strong>

                                  <p>
                                    {comment.text}
                                  </p>
                                </div>

                                <button
                                  className="delete-comment-button"
                                  onClick={() =>
                                    handleDeleteComment(
                                      task._id,
                                      comment._id
                                    )
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="add-comment">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={
                              commentText[
                                task._id
                              ] || ""
                            }
                            onChange={(event) =>
                              setCommentText(
                                (current) => ({
                                  ...current,
                                  [task._id]:
                                    event.target
                                      .value,
                                })
                              )
                            }
                          />

                          <button
                            onClick={() =>
                              handleAddComment(
                                task._id
                              )
                            }
                            disabled={
                              addingComment[
                                task._id
                              ]
                            }
                          >
                            {addingComment[
                              task._id
                            ]
                              ? "Adding..."
                              : "Add Comment"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Tasks;

