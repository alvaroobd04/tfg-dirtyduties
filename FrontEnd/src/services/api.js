import axios from "axios";
import { useAuthStore } from "@/composables/useAuth.js";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const auth = useAuthStore();
    const originalRequest = error.config;

    // 🔥 evitar crashes
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 🔥 error sin respuesta (timeout, red, IA lenta...)
    if (!error.response) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || "";

    // NO interceptar rutas de auth
    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout");

    if (isAuthRoute) {
      return Promise.reject(error);
    }

    // 🔥 NO interceptar subida de imagen (IA)
    const isUpload = url.includes("/validate");

    if (isUpload) {
      return Promise.reject(error);
    }

    // Si no es 401 → fuera
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Evitar loop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const res = await axios.post(
        "http://localhost:3000/auth/refresh",
        {},
        { withCredentials: true }
      );

      const newToken = res.data.accessToken;

      auth.accessToken = newToken;
      localStorage.setItem("accessToken", newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest);

    } catch (err) {
      localStorage.removeItem("accessToken");
      auth.accessToken = null;

      window.location.href = "/login";

      return Promise.reject(err);
    }
  }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 🔥 IMPORTANTE para subir imágenes
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  }

  return config;
});

export default api;