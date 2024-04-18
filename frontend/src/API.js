import axios from "axios";
import {jwtDecode} from "jwt-decode";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER, IsLoggedIn } from "./constants";

export const API_URL = "http://localhost:8000";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : API_URL,
});

const refreshToken = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN);
  try {
    const res = await API.post("/token/refresh/", {
      refresh: refreshToken,
    });
    if (res.status === 200) {
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      return res.data.access;
    }
  } catch (error) {
    console.log("Error refreshing token:", error);
    // Clear local storage and redirect to signup page
    localStorage.clear();
    window.location.href = "/signup";
  }
};

const auth = async () => {
  let token = localStorage.getItem(ACCESS_TOKEN);
  if (!token) {
    return null;
  }
  const decoded = jwtDecode(token);
  const tokenExpiration = decoded.exp;
  const now = Date.now() / 1000;

  if (tokenExpiration < now) {
    const newToken = await refreshToken();
    token = newToken ? newToken : null;
  }

  return token;
};

API.interceptors.request.use(
  async (config) => {
    const token = await auth();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
