
import apiFetch from "./api";

const getProjectActivities = async (projectId) => {
  return await apiFetch(`/projects/${projectId}/activities`);
};

export {
  getProjectActivities,
};

