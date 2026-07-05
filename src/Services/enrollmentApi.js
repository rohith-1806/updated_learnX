import apiClient from "./apiClient";

export const getMyEnrollments = async () => {
  const response = await apiClient.get(`/enrollments/me?t=${new Date().getTime()}`);
  return response.data.data || [];
};

export const enrollInCourse = async (courseId) => {
  const response = await apiClient.post("/enrollments", { courseId });
  return response.data;
};

export const updateProgress = async (enrollmentId, completedModuleId) => {
  const payload = { completedModuleId };
  const response = await apiClient.put(`/enrollments/${enrollmentId}/progress`, payload);
  return response.data;
};
