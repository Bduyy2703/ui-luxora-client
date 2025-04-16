import { notification } from "antd";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import publicAxios from "./publicAxios";
import privateAxios from "./privateAxios";
const API_URL = "http://35.247.185.8/api/";

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

export const login = async (email, password) => {
  try {
    const response = await publicAxios.post("/v1/auth/login", {
      email,
      password,
    });

    const accessToken =
      response.data.metadata?.accessToken || response.data.token;
    const decodedToken = jwtDecode(accessToken).roles;
    const userEmail = jwtDecode(accessToken).email;
    const userId = jwtDecode(accessToken).userId;

    const isVerified =
      response.data.metadata?.message !==
      "Email is not verified . Please check Email to verified";

    return { accessToken, userEmail, decodedToken, userId, isVerified };
  } catch (error) {
    const errorMessage =
      error.response?.data || "Có lỗi xảy ra, vui lòng thử lại!";
    console.error("Error:", errorMessage);
    throw new Error(errorMessage.error || error.message);
  }
};

// export const login = async (email, password) => {
//   try {
//     const response = await publicAxios.post("/v1/auth/login", {
//       email,
//       password,
//     });

//     if (response.data.verifyUrl) {
//       const verifyUrl = response.data.verifyUrl || null;
//       const accessToken = response.data.token;
//       const decodedToken = jwtDecode(accessToken).roles;
//       return { accessToken, decodedToken, verifyUrl };
//     } else {
//       if (
//         response.data.metadata.message ===
//         "Email is not verified . Please check Email to verified"
//       ) {
//         throw new Error(
//           "Email chưa được xác minh. Vui lòng kiểm tra email để xác minh.",
//         );
//       }

//       const accessToken = response.data.metadata.accessToken;
//       const decodedToken = jwtDecode(accessToken).roles;
//       const userEmail = jwtDecode(accessToken).email;
//       const userId = jwtDecode(accessToken).userId;
//       return { accessToken, userEmail, decodedToken, userId };
//     }
//   } catch (error) {
//     const errorMessage =
//       error.response?.data || "Có lỗi xảy ra, vui lòng thử lại!";
//     console.error("Error:", errorMessage);
//     throw new Error(errorMessage.error || error.message);
//   }
// };

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

// export const loginGoogle = async () => {
//   console.log(123);

//   try {
//     console.log(456);

//     const response = await axios.get(`${API_URL}/auth/google`);
//     console.log("response", response);

//     console.log(789);

//     return response.data;
//   } catch (error) {
//     console.error("Error details:", error); // Thêm dòng này để ghi lại thông tin lỗi
//     throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
//   }
// };
export const loginGoogle = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/google`, {
      withCredentials: true,
      maxRedirects: 0, // Chặn tự động điều hướng để kiểm soát
    });

    if (response.status === 302) {
      const authUrl = response.headers.location;
      window.location.href = authUrl; // Điều hướng thủ công
    } else {
      return response.data;
    }
  } catch (error) {
    if (error.response && error.response.status === 302) {
      const authUrl = error.response.headers.location;
      window.location.href = authUrl; // Điều hướng thủ công
    } else {
      console.error("Error details:", error);
      throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
    }
  }
};
