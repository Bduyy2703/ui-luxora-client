import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/api/authService";
import styles from "./register.module.scss";
import Breadcrumb from "../../components/Breadcrumb";
import { notification } from "antd";

export default function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const breadcrumbItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Đăng ký" },
  ];

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
        description:
          "Vui lòng kiểm tra email để lấy mã OTP và xác minh tài khoản!",
      });
      navigate("/otp");
    } catch (error) {
      notification.error({
        message: "Đăng ký thất bại",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại.",
      });
    }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className={styles["register-container"]}>
        <h1>ĐĂNG KÝ</h1>
        <p className={styles["login-link"]}>
          Đã có tài khoản, đăng nhập <Link to="/">tại đây</Link>
        </p>
        <form className={styles["register-form"]} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Họ và tên"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="tel"
            placeholder="Số điện thoại"
            required
            value={phoneNumber}
            onChange={(e) => setPhone(e.target.value)}
          />
          {phoneError && (
            <p style={{ marginBottom: "7px", color: "red" }}>{phoneError}</p>
          )}
          <input
            type="password"
            placeholder="Mật khẩu"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
          <button type="submit" className={styles["register-button"]}>
            ĐĂNG KÝ
          </button>
        </form>
        <div className={styles["social-login"]}>
          <p>Hoặc đăng nhập bằng</p>
          <div className={styles["social-buttons"]}>
            <button className={styles["facebook-button"]}>
              <i className="fab fa-facebook-f"></i> Facebook
            </button>
            <button className={styles["google-button"]}>
              <i className="fab fa-google"></i> Google
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
