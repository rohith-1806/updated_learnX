import { updateProgress } from "./enrollmentApi";

/**
 * Dedicated progress service.
 * Single responsibility: call the existing PUT /enrollments/:id/progress endpoint.
 * Never touches enrollment schema, routes, or any other API.
 */
export const markLessonComplete = async (enrollmentId, completedModuleId) => {
  console.log("STEP 4: progressService.markLessonComplete", { enrollmentId, completedModuleId });
  const res = await updateProgress(enrollmentId, completedModuleId);
  console.log("STEP 6: progressService received response", res);
  return res;
};
