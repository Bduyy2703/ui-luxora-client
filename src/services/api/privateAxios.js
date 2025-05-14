import axios from "axios";

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
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default privateAxios;

// import axios from "axios";
// import { jwtDecode } from "jwt-decode";

// const API_URL = "https://www.dclux.store/api/";

// const privateAxios = axios.create({
//   baseURL: API_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// const refreshAccessToken = async () => {
//   const refreshTokenValue = localStorage.getItem("refreshToken");
//   if (!refreshTokenValue) {
//     throw new Error("Không tìm thấy refresh token. Vui lòng đăng nhập lại.");
//   }

//   try {
//     console.log("Gọi API refresh token với refreshToken:", refreshTokenValue);
//     const response = await axios.post(`${API_URL}v1/auth/refresh`, {
//       refreshToken: refreshTokenValue,
//     });

//     const newAccessToken = response?.accessToken;
//     if (!newAccessToken || typeof newAccessToken !== "string") {
//       throw new Error("Access token không hợp lệ hoặc không tồn tại");
//     }

//     const { exp } = jwtDecode(newAccessToken);
//     const newExpiryTime = exp * 1000;

//     localStorage.setItem("accessToken", newAccessToken);
//     localStorage.setItem("tokenExpiry", newExpiryTime.toString());
//     console.log("Làm mới token thành công, token mới:", newAccessToken);

//     return newAccessToken;
//   } catch (error) {
//     console.error("Làm mới token thất bại:", error);
//     localStorage.clear();
//     window.location.href = "/";
//     throw error;
//   }
// };

// privateAxios.interceptors.request.use(
//   (config) => {
//     const accessToken = localStorage.getItem("accessToken");
//     if (accessToken) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//       console.log("Đã thêm Authorization header với token:", accessToken);
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// privateAxios.interceptors.response.use(
//   (response) => {
//     console.log("Request thành công:", response.config.url);
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       console.log("Phát hiện lỗi 401, đang làm mới token...");
//       originalRequest._retry = true;

//       try {
//         const newAccessToken = await refreshAccessToken();
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         console.log("Thử lại request với token mới:", newAccessToken);
//         return privateAxios(originalRequest);
//       } catch (refreshError) {
//         console.error("Làm mới token thất bại:", refreshError);
//         return Promise.reject(refreshError);
//       }
//     }

//     console.error("Lỗi không xử lý được:", error);
//     return Promise.reject(error);
//   }
// );

// export default privateAxios;