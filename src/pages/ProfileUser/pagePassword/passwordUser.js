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
        duration: 3,
      });
    } catch (error) {
      notification.error({
        message: "Đặt lại mật khẩu thất bại!",
        description:
          error.response?.data?.message ||
          "Mật khẩu của bạn không thể cập nhật.",
        duration: 3,
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
        <span className={styles.title}>ĐỔI MẬT KHẨU</span>

        <Card className={styles.card}>
          <span className={styles.note}>
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
              <Input
                type="password"
                placeholder="Nhập mật khẩu cũ"
                className={styles.input}
                aria-label="Mật khẩu cũ"
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                { min: 6, message: "Mật khẩu mới phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input
                type="password"
                placeholder="Nhập mật khẩu mới"
                className={styles.input}
                aria-label="Mật khẩu mới"
              />
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
              <Input
                type="password"
                placeholder="Xác nhận lại mật khẩu"
                className={styles.input}
                aria-label="Xác nhận lại mật khẩu"
              />
            </Form.Item>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.resetPassword}
                aria-label="Đặt lại mật khẩu"
              >
                Đặt lại mật khẩu
              </Button>
            </motion.div>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
};

export default PasswordUser;
