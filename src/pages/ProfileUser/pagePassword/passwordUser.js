import React, { useState } from "react";
import { Form, Input, Button, notification } from "antd";
import { changePassword } from "../../../services/api/userService";
import styles from "./PasswordUser.module.scss";
import { combineReducers } from "redux";

const PasswordUser = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const email = localStorage.getItem("userEmail"); // Thay đổi email bằng cách thích hợp

  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form
    setErrorMessage("");

    //Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 6) {
      setErrorMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    // Kiểm tra xem mật khẩu xác nhận có khớp không
    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      const response = await changePassword(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      notification.success({
        message: "Đặt lại mật khẩu thành công!",
        description: "Mật khẩu của bạn đã được cập nhật thành công.",
      });
    } catch (error) {
      // setErrorMessage("Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
      notification.error({
        message: "Đặt lại mật khẩu thất bại!",
        description: "Mật khẩu của bạn không thể cập nhật.",
      });
      console.error("Lỗi đặt lại mật khẩu:", error.response?.data);
    }
  };

  return (
    <div className={styles.profile}>
      <div className={styles.profileUser}>
        <span
          className={styles.changePassword}
          style={{ fontSize: "24px", fontWeight: "300" }}
        >
          ĐỔI MẬT KHẨU
        </span>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <form
          method="post"
          action={`/account/changepassword/?_method=PUT`}
          onSubmit={handleSubmit}
        >
          <span
            style={{ fontSize: "14px", fontWeight: "400", color: "#0a0000" }}
          >
            <strong>Lưu ý:</strong> Để đảm bảo tính bảo mật bạn vui lòng đặt lại
            mật khẩu với ít nhất 6 kí tự
          </span>
          <div style={{ marginBottom: "15px" }}>
            <Form.Item>
              Mật khẩu cũ *
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </Form.Item>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <Form.Item>
              Mật khẩu mới *
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </Form.Item>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <Form.Item>
              Xác nhận lại mật khẩu *
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </Form.Item>
          </div>
          <Button htmlType="submit" className={styles.resetPassword}>
            Đặt lại mật khẩu
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PasswordUser;
