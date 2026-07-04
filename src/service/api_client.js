import axios from "axios";
import keycloak from "../keycloak";

const api = axios.create({
  // baseURL: "https://10.240.138.254"//:8000",
  baseURL: "/api"
});

/**
 * REQUEST interceptor
 * - Attaches token
 * - Refreshes only if needed
 * - NEVER logs out here
 */
api.interceptors.request.use(
  async (config) => {
    // Keycloak not ready or user not authenticated yet
    if (!keycloak.authenticated) {
      return config;
    }

    try {
      // Refresh token only if it expires in <30s
      await keycloak.updateToken(30);

      // Attach token
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    } catch (err) {
      console.warn("Token refresh failed, request cancelled", err);
      // keycloak.logout()
      return Promise.reject(err);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE interceptor
 * - Logout ONLY when backend confirms auth failure
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && keycloak.authenticated) {
      // keycloak.logout();
      console.log("in here - 401")
    }
    return Promise.reject(error);
  }
);

export default api;
