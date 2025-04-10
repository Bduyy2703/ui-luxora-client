import React from "react";
import { useNavigate } from "react-router-dom";
import { verifyOTP } from "../../services/api/authService";
import styles from "./VerifyOTP.module.scss";
import { Form } from "antd";
import InputOtpField from "../../components/form/InputOtpField";
import OTP from "../../assets/icon/OTP.png";
import { notification } from "antd";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    const otpCode = values.otp;
    if (!/^\d{4}$/.test(otpCode)) {
      notification.error({
        message: "Mã OTP không hợp lệ",
        description: "Mã OTP phải là 4 chữ số.",
      });
      return;
    }
    try {
      const response = await verifyOTP(otpCode);
      notification.success({
        message: "Xác minh thành công",
        description: "Xác minh mã OTP thành công!",
      });
      navigate("/login");
    } catch (error) {
      notification.error({
        message: "Xác minh thất bại",
        description:
          error.message || "Mã OTP không đúng, vui lòng kiểm tra lại.",
      });
    }
  };

  return (
    <div className={styles.otp}>
      <div className={styles.otpContainer}>
        <img
          src={OTP}
          alt="OTP"
          style={{
            width: "120px",
            height: "120px",
            objectFit: "contain",
            background: "white",
          }}
        />
        <h4>Xác Minh OTP</h4>
        <Form form={form} onFinish={handleSubmit} className={styles.otpForm}>
          <InputOtpField
            name="otp"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "10px",
            }}
            required
            inputCount={4}
            className={styles.inputField}
            inputType="number"
          />
          <button type="submit" className={styles.active}>
            Xác Minh
          </button>
        </Form>
      </div>
    </div>
  );
}
