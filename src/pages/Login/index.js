import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  forgotPassword,
  login,
  loginGoogle,
  sendOTP,
} from "../../services/api/authService";
import styles from "./Login.module.scss";
import { notification } from "antd";
import { UserOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();


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
        localStorage.setItem("isVerified", isVerified.toString());

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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(forgotEmail);
      await sendOTP(forgotEmail);
      notification.success({
        message: "Thành công",
        description: "OTP đã được gửi, vui lòng kiểm tra email",
      });
      navigate("/reset-password");
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Không thể gửi OTP, vui lòng thử lại",
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

  return (
    <div className={styles.loginContainer}>
      <div className={styles.formWrapper}>
        <h1>ĐĂNG NHẬP</h1>
        <form className={styles.loginForm} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            {/* <UserOutlined className={styles.inputIcon} /> */}
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            {/* <LockOutlined className={styles.inputIcon} /> */}
            <input
              type="password"
              placeholder="Mật khẩu"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {passwordError && <p className={styles.errorText}>{passwordError}</p>}
          <button type="submit" className={styles.loginButton}>
            ĐĂNG NHẬP
          </button>
        </form>
        <div className={styles.forgotPasswordRegister}>
          <a
            href="#"
            className={styles.forgotPassword}
            onClick={() => setShowForgotPassword(true)}
          >
            Quên mật khẩu?
          </a>
          <Link to="/register" className={styles.registerLink}>
            Đăng ký tại đây
          </Link>
        </div>
        {showForgotPassword && (
          <div className={styles.forgotPasswordForm}>
            <div className={styles.inputGroup}>
              <UserOutlined className={styles.inputIcon} />
              <input
                type="email"
                placeholder="Nhập email để lấy lại mật khẩu"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>
            <div className={styles.forgotPasswordButtons}>
              <button
                className={styles.resetPasswordButton}
                onClick={handleForgotPassword}
              >
                Lấy lại mật khẩu
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowForgotPassword(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        )}
        <div className={styles.socialLogin}>
          <p>hoặc đăng nhập qua</p>
          <div className={styles.socialButtons}>
            <button onClick={loginGg} className={styles.googleButton}>
              <GoogleOutlined className={styles.socialIcon} /> Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
