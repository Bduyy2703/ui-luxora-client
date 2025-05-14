import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { refreshAccessToken } from "./refreshToken";

const API_URL = "https://www.dclux.store/api/";

const privateAxios = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

privateAxios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      if (process.env.NODE_ENV === "development") {
        console.log("Đã thêm Authorization header với token:", accessToken);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

privateAxios.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log("Request thành công:", response.config.url);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    originalRequest._retryCount = originalRequest._retryCount || 0;
    if (error.response?.status === 401 && originalRequest._retryCount < 1) {
      originalRequest._retryCount += 1;
      console.log("Phát hiện lỗi 401, đang làm mới token...");

      try {
        const refreshTokenValue = localStorage.getItem("refreshToken");
        if (!refreshTokenValue) {
          throw new Error("Không tìm thấy refresh token");
        }
        const newAccessToken = await refreshAccessToken(refreshTokenValue);
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          console.log("Thử lại request với token mới:", newAccessToken);
          return privateAxios(originalRequest);
        }
        throw new Error("Không thể làm mới token");
      } catch (refreshError) {
        console.error("Làm mới token thất bại:", refreshError);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    console.error("Lỗi không xử lý được:", error);
    return Promise.reject(error);
  },
);

export default privateAxios;
