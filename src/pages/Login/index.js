import React, { useState } from "react"; // Không cần useEffect nữa
import { Link, useNavigate } from "react-router-dom";
import {
  forgotPassword,
  login,
  loginGoogle,
  refreshToken,
  sendOTP,
} from "../../services/api/authService";
import { jwtDecode } from "jwt-decode";
import styles from "./Login.module.scss";
import { notification } from "antd";
import { UserOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { startTokenRefresh } from "../../services/api/refreshToken";

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
    }
    setPasswordError("");

    try {
      const { userEmail, accessToken, decodedToken, userId, isVerified } =
        await login(email, password);

      if (!isVerified) {
        notification.warning({
          message: "Email chưa xác minh",
          description: "Vui lòng kiểm tra email để xác minh tài khoản.",
        });
        return;
      }

      if (accessToken) {
        const { exp } = jwtDecode(accessToken);
        // const expiryTime = new Date().getTime() + 10 * 1000;
        const expiryTime = new Date().getTime() + 60 * 60 * 1000;

        localStorage.setItem("userEmail", userEmail);
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("decodedToken", decodedToken);
        localStorage.setItem("userId", userId);
        localStorage.setItem("isVerified", isVerified.toString());
        localStorage.setItem("tokenExpiry", expiryTime.toString());

        notification.success({
          message: "Đăng nhập thành công",
          description: "Bạn đã đăng nhập thành công",
        });

        startTokenRefresh();

        if (decodedToken === "USER") {
          navigate("/");
        } else if (decodedToken === "ADMIN") {
          navigate("/admin");
        } else {
          throw new Error("Vai trò không hợp lệ");
        }
      } else {
        throw new Error("Không nhận được token");
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
        description: error?.message || "Không thể gửi OTP, vui lòng thử lại",
      });
    }
  };

  const handleLoginGoogle = async () => {
    try {
      const authUrl = await loginGoogle();
      window.location.href = authUrl;
    } catch (error) {
      notification.error({
        message: "Yêu cầu xác thực thất bại",
        description: error?.message || "Không thể đăng nhập bằng Google",
      });
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.formWrapper}>
        <h1>ĐĂNG NHẬP</h1>

        <form className={styles.loginForm} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
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
          <button
            className={styles.forgotPassword}
            onClick={() => setShowForgotPassword(true)}
          >
            Quên mật khẩu?
          </button>
          <Link to="/register" className={styles.registerLink}>
            Đăng ký tại đây
          </Link>
        </div>

        {showForgotPassword && (
          <form
            className={styles.forgotPasswordForm}
            onSubmit={handleForgotPassword}
          >
            <div className={styles.inputGroup}>
              <input
                type="email"
                placeholder="Nhập email để lấy lại mật khẩu"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>
            <div className={styles.forgotPasswordButtons}>
              <button type="submit" className={styles.resetPasswordButton}>
                Lấy lại mật khẩu
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setShowForgotPassword(false)}
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        <div className={styles.socialLogin}>
          <p>hoặc đăng nhập qua</p>
          <div className={styles.socialButtons}>
            <button onClick={handleLoginGoogle} className={styles.googleButton}>
              <GoogleOutlined className={styles.socialIcon} /> Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
