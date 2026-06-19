import apiClient from "./apiClient";

export const sendChatMessage = async (message) => {
  try {
    const response = await apiClient.post("/helper/chat", { message });
    return response.data;
  } catch (error) {
    console.error("Chatbot API Error:", error);
    throw error;
  }
};
