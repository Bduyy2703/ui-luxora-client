import { notification } from "antd";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import publicAxios from "./publicAxios";
import privateAxios from "./privateAxios";
const API_URL = "https://www.dclux.store/api/";

export const verifyOTP = async (tokenOTP) => {
  try {
    const response = await axios.get(
      `${API_URL}v1/auth/confirm-email?tokenOTP=${encodeURIComponent(tokenOTP)}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Mã OTP không đúng, vui lòng kiểm tra lại.",
    );
  }
};

export const register = async (data) => {
  try {
    const response = await axios.post(`${API_URL}v1/auth/signup`, data);
    return response.data;
  } catch (error) {
    notification.error({
      message: "Đăng ký thất bại",
      description: "Đăng ký thất bại",
    });
    throw error;
  }
};

// export const login = async (email, password) => {
//   try {
//     const response = await publicAxios.post("/v1/auth/login", {
//       email,
//       password,
//     });

//     const accessToken =
//       response.data.metadata?.accessToken || response.data.token;
//     const decodedToken = jwtDecode(accessToken).roles;
//     const userEmail = jwtDecode(accessToken).email;
//     const userId = jwtDecode(accessToken).userId;

//     const isVerified =
//       response.data.metadata?.message !==
//       "Email is not verified . Please check Email to verified";

//     return { accessToken, userEmail, decodedToken, userId, isVerified };
//   } catch (error) {
//     const errorMessage =
//       error.response?.data || "Có lỗi xảy ra, vui lòng thử lại!";
//     console.error("Error:", errorMessage);
//     throw new Error(errorMessage.error || error.message);
//   }
// };

export const login = async (email, password) => {
  try {
    const response = await publicAxios.post("/v1/auth/login", {
      email,
      password,
    });

    const accessToken =
      response.data.metadata?.accessToken || response.data.token;
    const refreshToken = response.data.metadata?.refreshToken; // Add this if provided by API
    const decodedToken = jwtDecode(accessToken).roles;
    const userEmail = jwtDecode(accessToken).email;
    const userId = jwtDecode(accessToken).userId;

    const isVerified =
      response.data.metadata?.message !==
      "Email is not verified . Please check Email to verified";

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    return { accessToken, userEmail, decodedToken, userId, isVerified };
  } catch (error) {
    const errorMessage =
      error.response?.data || "Có lỗi xảy ra, vui lòng thử lại!";
    console.error("Error:", errorMessage);
    throw new Error(errorMessage.error || error.message);
  }
};

export const requestOTP = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/request-otp`, { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Yêu cầu OTP thất bại");
  }
};

export const sendOTP = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/send-otp`, { email });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Yêu cầu OTP thất bại");
  }
};

export const refreshToken = async (refreshTokenValue) => {
  try {
    const response = await privateAxios.post(`/v1/auth/refresh`, {
      refreshToken: refreshTokenValue,
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Làm mới token thất bại");
  }
};

// export const forgotPassword = async (email) => {
//   try {
//     const response = await privateAxios.post(
//       `${API_URL}v1/auth/forgot-password`,
//       {
//         email,
//       },
//     );

//     return response.data;
//   } catch (error) {
//     throw new Error(
//       error.response?.data?.message || "Đặt lại mật khẩu thất bại",
//     );
//   }
// };

export const forgotPassword = async (email) => {
  try {
    const response = await publicAxios.post("/v1/auth/forgot-password", {
      email,
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Đặt lại mật khẩu thất bại",
    );
  }
};

export const loginGoogle = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/google`, {
      withCredentials: true,
      maxRedirects: 0,
    });

    if (response.status === 302) {
      const authUrl = response.headers.location;
      window.location.href = authUrl;
    } else {
      return response.data;
    }
  } catch (error) {
    if (error.response && error.response.status === 302) {
      const authUrl = error.response.headers.location;
      window.location.href = authUrl;
    } else {
      console.error("Error details:", error);
      throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
    }
  }
};

export const logOut = async () => {
  try {
    const response = await privateAxios.get(`/v1/auth/logout`);
    return response.data || {};
  } catch (error) {
    console.error("Error logout:", error);
    return { error: error.message };
  }
};
