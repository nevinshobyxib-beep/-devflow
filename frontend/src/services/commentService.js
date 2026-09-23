import apiFetch from "./api";

const getComments = async (taskId) => {
  return await apiFetch(`/projects/tasks/${taskId}/comments`);
};

const createComment = async (taskId, text) => {
  return await apiFetch(`/projects/tasks/${taskId}/comments`, {
    method: "POST",
    body: JSON.stringify({
      text,
    }),
  });
};

const deleteComment = async (commentId) => {
  return await apiFetch(`/projects/comments/${commentId}`, {
    method: "DELETE",
  });
};

export {
  getComments,
  createComment,
  deleteComment,
};