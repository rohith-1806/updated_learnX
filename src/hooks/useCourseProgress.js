import { useCallback, useRef, useEffect } from "react";
import { useProgress } from "../context/ProgressContext";
import { markLessonComplete } from "../services/progressService";

/**
 * Custom hook for course-specific progress operations.
 * Reads from ProgressContext via ref to avoid stale closures.
 * Exposes a clean API for CoursePlayer.
 */
const useCourseProgress = (courseId) => {
  const { progressData, fetchCourseProgress, fetchAllUserProgress } = useProgress();

  // Always keep a ref to the latest progressData so callbacks never go stale
  const progressDataRef = useRef(progressData);
  useEffect(() => {
    progressDataRef.current = progressData;
  }, [progressData]);

  // Derived state from context for this specific course
  const courseData = progressData[courseId] || { percentage: 0, completedLessons: [] };
  const progress = courseData.percentage || 0;
  const completedLessons = courseData.completedLessons || [];
  const enrollmentId = courseData.enrollmentId || null;
  const status = courseData.status || "active";
  const originalEnrollment = courseData.originalEnrollment || null;

  const isLessonCompleted = useCallback(
    (lessonId) => {
      if (!lessonId) return false;
      return completedLessons.includes(lessonId);
    },
    [completedLessons]
  );

  const markComplete = useCallback(
    async (lessonId) => {
      // Read latest from ref, not closure
      const latest = progressDataRef.current[courseId];
      const eid = latest?.enrollmentId;

      console.log("STEP 2: useCourseProgress.markComplete", { courseId, lessonId, enrollmentId: eid });

      if (!eid) {
        console.error("STEP 2 FAILED: No enrollmentId for course", courseId);
        throw new Error("No enrollment found. Please enroll first.");
      }

      const alreadyDone = (latest.completedLessons || []).includes(lessonId);
      if (alreadyDone) {
        console.log("STEP 2: Already completed, skipping", lessonId);
        return;
      }

      // Call the dedicated progress service
      const res = await markLessonComplete(eid, lessonId);

      // After API success, refetch all enrollments so ProgressContext updates globally
      // This ensures Profile, CourseDetails, etc. all see the new progress
      await fetchAllUserProgress();

      console.log("STEP 9: useCourseProgress state refreshed");
      return res;
    },
    [courseId, fetchAllUserProgress]
  );

  return {
    progress,
    completedLessons,
    enrollmentId,
    status,
    originalEnrollment,
    isLessonCompleted,
    markComplete,
    fetchCourseProgress,
  };
};

export default useCourseProgress;
