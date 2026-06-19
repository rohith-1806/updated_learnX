import apiClient from "./apiClient";

export const registerUser = async (name, email, password) => {
  const response = await apiClient.post("/auth/register", { name, email, password });
  return response.data; // Expected: { success, token, user }
};

export const loginUser = async (email, password) => {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data; // Expected: { success, token, user }
};

export const getMe = async () => {
  const response = await apiClient.get("/auth/me");
  return response.data; // Expected: { success, user: { name, email, role, isVerified, ... } }
};

export const changePassword = async (newPassword) => {
  const response = await apiClient.put("/user/change-password", { newPassword });
  return response.data;
};

export const getUserEvents = async () => {
  const response = await apiClient.get("/user/events");
  return response.data.data || response.data.events || response.data;
};

export const registerForEvent = async (eventId) => {
  const response = await apiClient.post(`/user/events/register/${eventId}`);
  return response.data;
};

export const getMyEvents = async () => {
  const response = await apiClient.get("/user/my-events");
  return response.data.data || response.data.events || response.data;
};
