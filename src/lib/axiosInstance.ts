import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || "http://localhost:3000/api", // Base URL for all API requests
  timeout: 30000, // Request timeout in milliseconds (30 seconds for AI operations)
  headers: {
    "Content-Type": "application/json", // Default headers
  },
  transformRequest: [(data, headers) => {
    // Remove Content-Type header for FormData requests
    if (data instanceof FormData) {
      delete headers["Content-Type"];
      return data;
    } else {
      // Ensure Content-Type is set for JSON requests
      headers["Content-Type"] = "application/json";
      // Create a new object with only serializable properties
      const cleanData = data ? JSON.parse(JSON.stringify(data)) : data;
      return typeof cleanData === 'string' ? cleanData : JSON.stringify(cleanData);
    }
  }],
});
// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle response errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out. This might happen during AI operations that take longer than expected.');
    } else {
      console.error("API Error:", error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
