const API_URL = "http://localhost:5000/api";

const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...options.headers,
    },
  });

  const data = await response.json();

  return {
    response,
    data,
  };
};

export default apiFetch;