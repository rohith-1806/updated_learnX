import apiClient from "./apiClient";

/**
 * Notes API Service
 * Attempts to use backend /notes endpoint.
 * Falls back gracefully to localStorage if endpoint does not exist (404).
 */

const LS_KEY = (userId, courseId, videoId) =>
  `learnx_notes_${userId}_${courseId}_${videoId}`;

export const fetchNote = async (userId, courseId, videoId) => {
  try {
    const res = await apiClient.get(`/notes`, {
      params: { userId, courseId, videoId },
    });
    const note = res.data?.data || res.data;
    return note?.content ?? note?.text ?? (typeof note === "string" ? note : "");
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 400) {
      // Endpoint doesn't exist or no note found — fall back to localStorage
      return localStorage.getItem(LS_KEY(userId, courseId, videoId)) || "";
    }
    // Network error or other — silently fall back
    return localStorage.getItem(LS_KEY(userId, courseId, videoId)) || "";
  }
};

export const saveNote = async (userId, courseId, videoId, content) => {
  // Always persist to localStorage as an instant local backup
  localStorage.setItem(LS_KEY(userId, courseId, videoId), content);

  try {
    await apiClient.post(`/notes`, {
      userId,
      courseId,
      videoId,
      content,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      // Backend notes endpoint doesn't exist — localStorage backup is sufficient
      return;
    }
    // For other errors, localStorage already saved — no alert needed
    console.warn("Notes API save failed, localStorage backup used.", err.message);
  }
};

export const deleteNote = async (userId, courseId, videoId) => {
  localStorage.removeItem(LS_KEY(userId, courseId, videoId));
  try {
    await apiClient.delete(`/notes`, {
      params: { userId, courseId, videoId },
    });
  } catch (err) {
    // Silently handle if endpoint doesn't exist
    if (err.response?.status !== 404) {
      console.warn("Notes API delete failed:", err.message);
    }
  }
};
