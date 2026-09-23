import apiFetch from "./api";

const getDashboardStats = async () => {
  return await apiFetch("/dashboard/stats");
};

export { getDashboardStats };