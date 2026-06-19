import apiClient from "./apiClient";

export const getMyEnrollments = async () => {
  const response = await apiClient.get("/enrollments/me");
  const data = response.data.data || response.data || [];
  if (Array.isArray(data)) {
    return data.map((enroll) => {
      // Normalize progress from backend — use progressPercentage as source of truth
      const backendProgress = enroll.progressPercentage !== undefined
        ? enroll.progressPercentage
        : (enroll.progress || 0);

      // Build clean course name from courseId populated object
      const courseName = enroll.courseId?.name || enroll.courseId?.title || (typeof enroll.courseId === "string" ? enroll.courseId : "");

      return {
        ...enroll,
        course: {
          name: courseName,
          title: courseName,
        },
        progressPercentage: backendProgress,
        progress: backendProgress,
      };
    });
  }
  return data;
};

export const enrollInCourse = async (courseId) => {
  const response = await apiClient.post("/enrollments", { courseId });
  return response.data;
};

export const updateProgress = async (enrollmentId, completedModuleId) => {
  const response = await apiClient.put(`/enrollments/${enrollmentId}/progress`, {
    completedModuleId: completedModuleId,
  });
  return response.data;
};
