import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:8787/api/v1"
      : "https://backend.lalit2005.workers.dev/api/v1",
  headers: {
    "Content-Type": "application/json",
    token:
      typeof localStorage !== "undefined"
        ? localStorage.getItem("token")
        : "no-token",
  },
  withCredentials: true,
});

export default api;
