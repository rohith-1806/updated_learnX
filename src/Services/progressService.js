import { updateProgress } from "./enrollmentApi";

/**
 * Dedicated progress service.
 * Single responsibility: call the existing PUT /enrollments/:id/progress endpoint.
 * Never touches enrollment schema, routes, or any other API.
 */
export const markLessonComplete = async (enrollmentId, lessonId) => {
  console.log("STEP 4: progressService.markLessonComplete", { enrollmentId, lessonId });
  const res = await updateProgress(enrollmentId, lessonId);
  console.log("STEP 6: progressService received response", res);
  return res;
};
