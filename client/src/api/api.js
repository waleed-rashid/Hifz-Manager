import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000",
});

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getDashboardData = async () => {
  const res = await api.get("/dashboard", {
    headers: getAuthHeaders(),
  });

  return res.data;
};

export const createDailyEntry = async (entry) => {
  const res = await api.post("/entries", entry, {
    headers: getAuthHeaders(),
  });

  return res.data;
};
