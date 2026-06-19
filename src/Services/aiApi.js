import apiClient from "./apiClient";

export const generateAICourse = async (courseName, domainId) => {
  const response = await apiClient.post("/ai/generate-course", { courseName, domainId });
  return response.data; // Expected: { success, course/data }
};
