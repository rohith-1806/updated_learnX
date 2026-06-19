import apiClient from "./apiClient";

export const chatWithHelper = async (message) => {
  const response = await apiClient.post("/helper/chat", { message });
  return response.data; // Expected: { reply: "..." }
};
