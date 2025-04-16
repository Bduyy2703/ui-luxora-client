import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  forgotPassword,
  getGoogleAuthUrl,
  login,
  loginGoogle,
  sendOTP,
} from "../../services/api/authService";
import styles from "./Login.module.scss";
import Breadcrumb from "../../components/Breadcrumb";
import { notification } from "antd";
import { getProfile } from "../../services/api/userService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = useState("");
  const breadcrumbItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Đăng nhập" },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    } else {
      setPasswordError("");
    }
    try {
      const { userEmail, accessToken, decodedToken, userId, isVerified } =
        await login(email, password);

      if (accessToken) {
        notification.success({
          message: "Đăng nhập thành công",
          description: "Bạn đã đăng nhập thành công",
        });
        setEmail(userEmail);
        localStorage.setItem("userEmail", userEmail);
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("decodedToken", decodedToken);
        localStorage.setItem("userId", userId);
        localStorage.setItem("isVerified", isVerified.toString()); // Lưu trạng thái xác minh

        if (decodedToken === "USER") {
          navigate("/");
        } else if (decodedToken === "ADMIN") {
          navigate("/admin");
        } else {
          notification.error({
            message: "Đăng nhập thất bại",
            description: "Vai trò không hợp lệ",
          });
          return;
        }
      } else {
        notification.error({
          message: "Đăng nhập thất bại",
          description: "Thông tin đăng nhập không đúng",
        });
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      notification.error({
        message: "Đăng nhập thất bại",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại.",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await forgotPassword(forgotEmail);
      notification.success({
        message: "Thông báo",
        description: "Đặt lại mật khẩu thành công",
        duration: 3,
      });
      return response;
    } catch (error) {
      notification.error({
        message: "Thông báo",
        description: "Đặt lại mật khẩu thất bại",
        duration: 3,
      });
    }
  };

  const loginGg = async () => {
    try {
      const authUrl = await loginGoogle();
      window.location.href = authUrl;
    } catch (error) {
      notification.error({
        message: "Yêu cầu xác thực thất bại",
        description: error.message,
      });
    }
  };

  const handleResetPassword = async () => {
    try {
      const otpData = await sendOTP(forgotEmail);
      navigate("/reset-password");
    } catch (error) {
      notification.error({
        message: "Yêu cầu OTP thất bại",
        description: error.message,
      });
    }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className={styles.loginContainer}>
        <div>
          <h1>ĐĂNG NHẬP</h1>
          <form className={styles.loginForm} onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordError && (
              <p style={{ marginTop: "-10px", color: "red" }}>
                {passwordError}
              </p>
            )}
            <button type="submit" className={styles.loginButton}>
              ĐĂNG NHẬP
            </button>
          </form>
          <div className={styles.forgotPasswordRegister}>
            <a
              href="#"
              className={styles.forgotPassword}
              onClick={() => setShowForgotPassword(!showForgotPassword)}
            >
              Quên mật khẩu?
            </a>
            <Link to="/register" className={styles.registerLink}>
              Đăng ký tại đây
            </Link>
          </div>
          {showForgotPassword && (
            <div className={styles.forgotPasswordForm}>
              <input
                type="email"
                placeholder="Nhập email để lấy lại mật khẩu"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
              <button
                className={styles.resetPasswordButton}
                onClick={handleSubmit}
              >
                Lấy lại mật khẩu
              </button>
            </div>
          )}
          <div className={styles.socialLogin}>
            <p>hoặc đăng nhập qua</p>
            <div className={styles.socialButtons}>
              <button onClick={() => loginGg()} className={styles.googleButton}>
                <i className="fab fa-google"></i> Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
