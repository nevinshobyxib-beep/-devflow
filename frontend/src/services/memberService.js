import apiFetch from "./api";

const getProjectMembers = async (projectId) => {
  return await apiFetch(`/projects/${projectId}/members`);
};

const addProjectMember = async (projectId, email) => {
  return await apiFetch(`/projects/${projectId}/members`, {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });
};

const removeProjectMember = async (projectId, userId) => {
  return await apiFetch(
    `/projects/${projectId}/members/${userId}`,
    {
      method: "DELETE",
    }
  );
};

export {
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
};