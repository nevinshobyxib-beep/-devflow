import apiFetch from "./api";

const getTasks = async (projectId, search = "", status = "") => {
  let url = `/tasks/${projectId}/tasks`;

  const params = new URLSearchParams();

  if (search) {
    params.append("search", search);
  }

  if (status) {
    params.append("status", status);
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  return await apiFetch(url);
};

const getTask = async (id) => {
  return await apiFetch(`/tasks/tasks/${id}`);
};

const createTask = async (projectId, taskData) => {
  return await apiFetch(`/tasks/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify(taskData),
  });
};

const updateTask = async (id, taskData) => {
  return await apiFetch(`/tasks/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(taskData),
  });
};

const deleteTask = async (id) => {
  return await apiFetch(`/tasks/tasks/${id}`, {
    method: "DELETE",
  });
};

export {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};