import apiClient from "./apiClient";

const extractData = (response) => {
  const data = response.data?.data || [];
  if (!Array.isArray(data)) {
    return [];
  }
  return data;
};

export const getDepartments = async () => {
  const response = await apiClient.get("/hierarchy/departments");
  return extractData(response);
};

export const getCategories = async (departmentId) => {
  const response = await apiClient.get(`/hierarchy/categories?departmentId=${departmentId}`);
  return extractData(response);
};

export const getDomains = async (categoryId) => {
  const response = await apiClient.get(`/hierarchy/domains?categoryId=${categoryId}`);
  return extractData(response);
};

export const getTracks = async (domainId) => {
  const response = await apiClient.get(`/hierarchy/tracks?domainId=${domainId}`);
  return extractData(response);
};
