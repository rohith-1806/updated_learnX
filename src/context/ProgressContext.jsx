import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getMyEnrollments, updateProgress as apiUpdateProgress } from "../services/enrollmentApi";
import { useAuth } from "./AuthContext";

const ProgressContext = createContext(null);

export const ProgressProvider = ({ children }) => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState({});
  const progressDataRef = useRef(progressData);
  const [loading, setLoading] = useState(true);

  // Keep ref in sync so callbacks always read latest
  useEffect(() => { progressDataRef.current = progressData; }, [progressData]);

  const fetchAllUserProgress = useCallback(async () => {
    if (!user) {
      setProgressData({});
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getMyEnrollments();
      const newProgressData = {};
      if (Array.isArray(data)) {
        data.forEach(enroll => {
          const cId = enroll.courseId?._id || enroll.courseId;
          if (cId) {
            const fetchedProgress = enroll.progressPercentage !== undefined ? enroll.progressPercentage : (enroll.progress || 0);
            let finalCompleted = enroll.completedModules || enroll.completedSubModules || [];
            finalCompleted = finalCompleted.map(m => typeof m === "object" && m !== null ? m._id : m);
            
            newProgressData[cId] = {
              percentage: fetchedProgress,
              completedLessons: finalCompleted,
              enrollmentId: enroll._id,
              status: enroll.status || "active",
              originalEnrollment: enroll
            };
          }
        });
        setProgressData(newProgressData);
      }
    } catch (err) {
      console.error("Failed to fetch global enrollments", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllUserProgress();
  }, [fetchAllUserProgress]);

  useEffect(() => {
    const handleFocus = () => {
      if (user) fetchAllUserProgress();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, fetchAllUserProgress]);

  const fetchCourseProgress = useCallback(async (courseId) => {
    await fetchAllUserProgress();
  }, [fetchAllUserProgress]);

  const handleComplete = useCallback(async (courseId, lessonId) => {
     // Always read from ref to avoid stale closure
     const latestData = progressDataRef.current;
     console.log("STEP 3: ProgressContext handleComplete called", { courseId, lessonId, hasData: !!latestData[courseId] });
     const currentData = latestData[courseId];
     if (!currentData || !currentData.enrollmentId) {
       console.error("STEP 3 FAILED: No enrollment data found for courseId", courseId, currentData);
       return null;
     }
     console.log("STEP 3: enrollmentId =", currentData.enrollmentId);

     const completedList = currentData.completedLessons || [];
     if (completedList.includes(lessonId)) {
       console.log("STEP 3: Already completed, skipping", lessonId);
       return null;
     }

     try {
       console.log("STEP 4: Calling API updateProgress", { enrollmentId: currentData.enrollmentId, lessonId });
       const res = await apiUpdateProgress(currentData.enrollmentId, lessonId);
       console.log("STEP 6: API response received", res);
       
       if (res) {
         const updatedEnrollment = res.data || res.enrollment || res;
         setProgressData(prev => {
           const newProgress = { ...prev };
           const cId = updatedEnrollment.courseId?._id || updatedEnrollment.courseId || courseId;
           if (cId) {
             const fetchedProgress = updatedEnrollment.progressPercentage !== undefined 
               ? updatedEnrollment.progressPercentage 
               : (updatedEnrollment.progress !== undefined ? updatedEnrollment.progress : prev[cId]?.percentage || 0);
             let finalCompleted = updatedEnrollment.completedModules || updatedEnrollment.completedSubModules || [];
             finalCompleted = finalCompleted.map(m => typeof m === "object" && m !== null ? m._id : m);

             newProgress[cId] = {
               ...newProgress[cId],
               percentage: fetchedProgress,
               completedLessons: finalCompleted,
               originalEnrollment: updatedEnrollment
             };
           }
           return newProgress;
         });
       }
       return res;
     } catch (err) {
       console.error("Failed to mark complete:", err);
       throw err;
     }
  }, []);  // No dependency on progressData — we read from ref

  return (
    <ProgressContext.Provider value={{ progressData, loading, handleComplete, fetchCourseProgress, fetchAllUserProgress }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);
