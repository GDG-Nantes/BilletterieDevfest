export const CONFIG = {
  adminApiBaseUrl: import.meta.env.MODE === "development" ? "http://localhost:8080/admin-api" : "/admin-api",
  apiBaseUrl: import.meta.env.MODE === "development" ? "http://localhost:8080/api" : "/api",
  authClientId: "94669066373-92okun8fp55t7tm9lehp69ekc8vnn9m5.apps.googleusercontent.com",
};
