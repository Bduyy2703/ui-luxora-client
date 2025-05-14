import { refreshToken } from "./authService";
import { notification } from "antd";
import { jwtDecode } from "jwt-decode";

const refreshAccessToken = async (refreshTokenValue) => {
  console.log("Đang làm mới token...");
  try {
    const response = await refreshToken(refreshTokenValue);
    console.log("Response từ API:", response);

    const newAccessToken = response?.data?.accessToken;

    if (!newAccessToken || typeof newAccessToken !== "string") {
      throw new Error("Access token không hợp lệ hoặc không tồn tại");
    }

    const { exp } = jwtDecode(newAccessToken);
    const newExpiryTime = exp * 1000;
    // const newExpiryTime = new Date().getTime() + 10 * 1000;

    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("tokenExpiry", newExpiryTime.toString());

    notification.success({
      message: "Làm mới token thành công",
      description: "Token đã được làm mới.",
    });

    return newAccessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    notification.error({
      message: "Làm mới token thất bại",
      description: error.message || "Vui lòng đăng nhập lại.",
    });
    localStorage.clear();
    window.location.href = "/login";
    return null;
  }
};

export const startTokenRefresh = () => {
  const refreshTokenValue = localStorage.getItem("refreshToken");
  if (!refreshTokenValue || typeof refreshTokenValue !== "string") {
    console.error("Refresh token không hợp lệ hoặc không tồn tại");
    notification.error({
      message: "Làm mới token thất bại",
      description: "Không tìm thấy refresh token. Vui lòng đăng nhập lại.",
    });
    localStorage.clear();
    window.location.href = "/login";
    return;
  }

  const checkTokenExpiry = async () => {
    const currentTime = new Date().getTime();
    const storedExpiry = parseInt(localStorage.getItem("tokenExpiry"), 10);
    console.log(
      `Kiểm tra token: Current time: ${currentTime}, Expiry time: ${storedExpiry}, Diff: ${storedExpiry - currentTime}`,
    );

    if (currentTime >= storedExpiry) {
      console.log("Token đã hết hạn, đang gọi refresh...");
      await refreshAccessToken(refreshTokenValue);
    } else {
      console.log("Token chưa hết hạn.");
    }
  };

  const intervalId = setInterval(checkTokenExpiry, 60000);
  return () => clearInterval(intervalId);
};
