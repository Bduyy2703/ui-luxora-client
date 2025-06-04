import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/api/authService";
import styles from "./register.module.scss";
import { notification } from "antd";
import { GoogleOutlined } from "@ant-design/icons";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    } else {
      setPasswordError("");
    }
    if (!/^(0\d{9})$/.test(phoneNumber)) {
      setPhoneError("Số điện thoại không hợp lệ.");
      return;
    } else {
      setPhoneError("");
    }
    const data = { email, password, username, phoneNumber };
    try {
      const response = await register(data);
      notification.success({
        message: "Đăng ký thành công",
        description: "Bạn đã đăng ký thành công, vui lòng đăng nhập!",
      });
      navigate("/login");
    } catch (error) {
      notification.error({
        message: "Đăng ký thất bại",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại.",
      });
    }
  };

  const loginGg = async () => {
    // Tạm dùng loginGoogle từ Login, cần API riêng cho Register nếu có
    try {
      const authUrl = await import("../../services/api/authService").then(
        (module) => module.loginGoogle(),
      );
      window.location.href = authUrl;
    } catch (error) {
      notification.error({
        message: "Yêu cầu xác thực thất bại",
        description: error.message,
      });
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.formWrapper}>
        <h1>ĐĂNG KÝ</h1>
        <p className={styles.loginLink}>
          Đã có tài khoản, đăng nhập <Link to="/login">tại đây</Link>
        </p>
        <form className={styles.registerForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Họ và tên"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
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
              type="tel"
              placeholder="Số điện thoại"
              required
              value={phoneNumber}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          {phoneError && <p className={styles.errorText}>{phoneError}</p>}
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
          <button type="submit" className={styles.registerButton}>
            ĐĂNG KÝ
          </button>
        </form>
      </div>
    </div>
  );
}
