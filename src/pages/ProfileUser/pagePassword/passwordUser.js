import { Button, Form, Input, notification, Card } from "antd";
import { motion } from "framer-motion";
import styles from "./PasswordUser.module.scss";
import { changePassword } from "../../../services/api/userService";

const PasswordUser = () => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      await changePassword(values.oldPassword, values.newPassword);
      form.resetFields();
      notification.success({
        message: "Đặt lại mật khẩu thành công!",
        description: "Mật khẩu của bạn đã được cập nhật thành công.",
      });
    } catch (error) {
      notification.error({
        message: "Đặt lại mật khẩu thất bại!",
        description: "Mật khẩu của bạn không thể cập nhật.",
      });
      console.error("Lỗi đặt lại mật khẩu:", error.response?.data);
    }
  };

  return (
    <div className={styles.profile}>
      <motion.div
        className={styles.profileUser}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <span className={styles.changePassword}>ĐỔI MẬT KHẨU</span>

        <Card
          style={{
            background: "#FFF",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
            padding: "20px",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              fontWeight: "400",
              color: "#4A4A4A",
              display: "block",
              marginBottom: "20px",
            }}
          >
            <strong>Lưu ý:</strong> Để đảm bảo tính bảo mật, bạn vui lòng đặt
            lại mật khẩu với ít nhất 6 ký tự.
          </span>

          <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
              label="Mật khẩu cũ"
              name="oldPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu cũ!" },
              ]}
            >
              <Input type="password" placeholder="Nhập mật khẩu cũ" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                { min: 6, message: "Mật khẩu mới phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input type="password" placeholder="Nhập mật khẩu mới" />
            </Form.Item>

            <Form.Item
              label="Xác nhận lại mật khẩu"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận lại mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!"),
                    );
                  },
                }),
              ]}
            >
              <Input type="password" placeholder="Xác nhận lại mật khẩu" />
            </Form.Item>

            <motion.div>
              <div
                onClick={() => form.submit()}
                className={styles.resetPassword}
              >
                Đặt lại mật khẩu
              </div>
            </motion.div>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
};

export default PasswordUser;
