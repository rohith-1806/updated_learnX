import axios from "axios";

const BASE_URL = "https://brillon-tasks-1.onrender.com/api/v1";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach bearer token dynamically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("userToken");
    if (token && token !== "null" && token !== "undefined" && token.trim() !== "") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for 401 errors and network errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid — clear auth state and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("userToken");
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("adminToken");

      // Only redirect if not already on a login/register page
      const path = window.location.pathname;
      if (
        !path.includes("/user-login") &&
        !path.includes("/create-account") &&
        !path.includes("/admin-login") &&
        !path.includes("/admin")
      ) {
        window.location.href = "/user-login";
      }
    }

    if (!error.response) {
      // Network error (no response from server)
      console.error("Network error: Unable to reach server.", error.message);
      error.message = "Unable to reach the server. Please check your internet connection.";
    }

    return Promise.reject(error);
  }
);

export default apiClient;
