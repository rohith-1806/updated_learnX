import { useCallback, useRef, useEffect } from "react";
import { useProgress } from "../context/ProgressContext";
import { markLessonComplete } from "../services/progressService";

/**
 * Custom Hook
 * Handles course progress, completed lessons and mark complete action.
 */

const useCourseProgress = (courseId) => {
  const {
    progressData,
    fetchCourseProgress,
  } = useProgress();

  // Always keep latest progress data
  const progressDataRef = useRef(progressData);

  useEffect(() => {
    progressDataRef.current = progressData;
  }, [progressData]);

  // Current course progress
  const courseData = progressData[courseId] || {
    percentage: 0,
    completedLessons: [],
    enrollmentId: null,
    status: "active",
    originalEnrollment: null,
  };

  const progress = Number(courseData.percentage || 0);

  const completedLessons = Array.isArray(courseData.completedLessons)
    ? courseData.completedLessons
    : [];

  const enrollmentId = courseData.enrollmentId || null;

  const status = courseData.status || "active";

  const originalEnrollment = courseData.originalEnrollment || null;

  /**
   * Check lesson completed
   */
  const isLessonCompleted = useCallback(
    (lessonId) => {
      if (!lessonId) return false;

      return completedLessons.includes(String(lessonId));
    },
    [completedLessons]
  );

  /**
   * Mark lesson complete
   */
  const markComplete = useCallback(
    async (lessonId) => {
      if (!lessonId) {
        throw new Error("Lesson ID is missing.");
      }

      const latestCourse =
        progressDataRef.current[courseId] || {};

      const currentEnrollmentId =
        latestCourse.enrollmentId;

      if (!currentEnrollmentId) {
        throw new Error("Enrollment not found.");
      }

      const alreadyCompleted =
        (latestCourse.completedLessons || []).includes(
          String(lessonId)
        );

      if (alreadyCompleted) {
        return latestCourse;
      }

      try {
        console.log("Updating Progress...", {
          enrollmentId: currentEnrollmentId,
          lessonId,
        });

        // Backend API
        const response = await markLessonComplete(
          currentEnrollmentId,
          lessonId
        );

        console.log("Progress Updated", response);

        // Refresh ONLY this course
        await fetchCourseProgress(courseId);

        return response;
      } catch (error) {
        console.error("Failed to update progress", error);
        throw error;
      }
    },
    [courseId, fetchCourseProgress]
  );

  /**
   * Reload course progress
   */
  const refreshProgress = useCallback(async () => {
    if (!courseId) return;

    try {
      await fetchCourseProgress(courseId);
    } catch (err) {
      console.error(err);
    }
  }, [courseId, fetchCourseProgress]);

  return {
    progress,
    completedLessons,
    enrollmentId,
    status,
    originalEnrollment,
    isLessonCompleted,
    markComplete,
    fetchCourseProgress: refreshProgress,
  };
};

export default useCourseProgress;