import { refreshToken } from "./authService";
import { notification } from "antd";
import { jwtDecode } from "jwt-decode";

export const refreshAccessToken = async (refreshTokenValue) => {
  console.log("Đang làm mới token với refreshToken:", refreshTokenValue);
  try {
    const response = await refreshToken(refreshTokenValue);
    console.log("Response từ API refresh:", response);

    const newAccessToken = response?.data?.accessToken || response?.accessToken;
    const newRefreshToken = response?.data?.refreshToken || response?.refreshToken;

    if (!newAccessToken || typeof newAccessToken !== "string") {
      throw new Error("Access token không hợp lệ hoặc không tồn tại");
    }

    const { exp } = jwtDecode(newAccessToken);
    const newExpiryTime = exp * 1000;

    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("tokenExpiry", newExpiryTime.toString());
    if (newRefreshToken && typeof newRefreshToken === "string") {
      localStorage.setItem("refreshToken", newRefreshToken);
      console.log("Đã lưu refresh token mới:", newRefreshToken);
    } else {
      console.log("Không nhận được refresh token mới từ API");
    }

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
  const getRefreshTokenValue = () => localStorage.getItem("refreshToken");

  if (!getRefreshTokenValue() || typeof getRefreshTokenValue() !== "string") {
    console.error("Refresh token không hợp lệ hoặc không tồn tại");
    notification.error({
      message: "Làm mới token thất bại",
      description: "Không tìm thấy refresh token. Vui lòng đăng nhập lại.",
    });
    localStorage.clear();
    window.location.href = "/login";
    return () => {};
  }

  const checkTokenExpiry = async () => {
    const currentTime = new Date().getTime();
    const storedExpiry = parseInt(localStorage.getItem("tokenExpiry"), 10);
    console.log(
      `Kiểm tra token: Current time: ${currentTime}, Expiry time: ${storedExpiry}, Diff: ${storedExpiry - currentTime}`,
    );

    if (currentTime >= storedExpiry) {
      console.log("Token đã hết hạn, đang gọi refresh...");
      await refreshAccessToken(getRefreshTokenValue());
    } else {
      console.log("Token chưa hết hạn.");
    }
  };

  const checkIntervalId = setInterval(checkTokenExpiry, 60000);

  const refreshIntervalId = setInterval(async () => {
    const refreshTokenValue = getRefreshTokenValue();
    if (!refreshTokenValue) {
      console.error("Refresh token không tồn tại trong lần gọi 10 giây");
      clearInterval(checkIntervalId);
      clearInterval(refreshIntervalId);
      localStorage.clear();
      window.location.href = "/login";
      return;
    }
    console.log("Gọi API refresh token mỗi 10 giây...");
    await refreshAccessToken(refreshTokenValue);
  }, 3600 * 1000);

  return () => {
    console.log("Clear intervals for token refresh");
    clearInterval(checkIntervalId);
    clearInterval(refreshIntervalId);
  };
};