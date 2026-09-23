import apiFetch from "./api";

const getProjects = async () => {
  return await apiFetch("/projects");
};

const getProject = async (id) => {
  return await apiFetch(`/projects/${id}`);
};

const createProject = async (projectData) => {
  return await apiFetch("/projects", {
    method: "POST",
    body: JSON.stringify(projectData),
  });
};

const updateProject = async (id, projectData) => {
  return await apiFetch(`/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(projectData),
  });
};

const deleteProject = async (id) => {
  return await apiFetch(`/projects/${id}`, {
    method: "DELETE",
  });
};

export {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};