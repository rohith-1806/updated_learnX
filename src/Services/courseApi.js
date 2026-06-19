import apiClient from "./apiClient";

const extractDataArray = (response) => {
  const data = response.data?.data || [];
  if (!Array.isArray(data)) {
    return [];
  }
  return data;
};

export const getCourses = async (domainId) => {
  const response = await apiClient.get(`/content/courses?domainId=${domainId}`);
  return extractDataArray(response);
};

export const getCourseDetails = async (courseId) => {
  try {
    // Try fetching the course directly if the API supports it
    const response = await apiClient.get(`/content/courses/${courseId}`);
    if (response.data && (response.data.data || response.data)) {
      return response.data.data || response.data;
    }
  } catch (err) {
    console.warn("Direct course fetch failed, falling back to listing courses", err);
  }

  // Fallback: fetch all courses and search by ID
  const response = await apiClient.get("/content/courses");
  const list = extractDataArray(response);
  return list.find((c) => c._id === courseId);
};

export const getModules = async (courseId) => {
  const response = await apiClient.get(`/content/modules?courseId=${courseId}`);
  return extractDataArray(response);
};

export const getSubModules = async (moduleId) => {
  const response = await apiClient.get(`/content/sub-modules?moduleId=${moduleId}`);
  return extractDataArray(response);
};

export const getVideos = async (subModuleId) => {
  const response = await apiClient.get(`/content/videos?subModuleId=${subModuleId}`);
  return extractDataArray(response);
};

export const getAssignments = async (moduleId) => {
  const response = await apiClient.get(`/content/assignments?moduleId=${moduleId}`);
  return extractDataArray(response);
};

export const getFinalAssignments = async (courseId) => {
  const response = await apiClient.get(`/content/final-assignments?courseId=${courseId}`);
  return extractDataArray(response);
};
