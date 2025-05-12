import { useEffect, useState } from "react";
import { defineMessages } from "react-intl";
import { getProfile } from "../../../services/api/userService";
import { Modal, Form, Input, Button, message, Card, notification } from "antd";
import { motion } from "framer-motion";
import styles from "./ProfileUser.module.scss";
import { updateProfile } from "../../../services/api/profileService";

const messages = defineMessages({
  jewelryTitle: {
    id: "src.pages.Login.index.jewelry",
    defaultMessage: "Jewelry",
  },
});

const ProfileUser = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const breadcrumbItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Trang khách hàng" },
  ];

  // Lấy dữ liệu hồ sơ
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setProfileData(data);
      } catch (err) {
        console.error("Error details:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Mở Modal và điền dữ liệu vào form
  const showModal = () => {
    form.setFieldsValue({
      firstName: profileData?.firstName || "",
      lastName: profileData?.lastName || "",
      phoneNumber: profileData?.phoneNumber || "",
      socialMedia: profileData?.socialMedia || "",
    });
    setIsModalVisible(true);
  };

  // Xử lý khi nhấn Lưu trong Modal
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await updateProfile(values);
      const updatedData = await getProfile();
      setProfileData(updatedData);
      setIsModalVisible(false);
      notification.success({
        message: "Thông báo",
        description: "Cập nhật thông tin thành công",
        duration: 3,
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      notification.error({
        message: "Thông báo",
        description: "Cập nhật thông tin thất bại",
        duration: 3,
      });
    }
  };

  // Đóng Modal
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const defaultAddress =
    profileData?.user?.addresses?.find(
      (address) => address.isDefault === true,
    ) ||
    profileData?.defaultAddress ||
    profileData?.user?.addresses?.[0];

  return (
    <div className={styles.profile}>
      <motion.div
        className={styles.profileUser}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <span
          style={{
            fontSize: "24px",
            fontWeight: "300",
            color: "#4a4a4a",
            marginBottom: "20px",
            display: "block",
          }}
        >
          THÔNG TIN TÀI KHOẢN
        </span>

        {loading && <p style={{ color: "#4A4A4A" }}>Đang tải...</p>}
        {error && (
          <p style={{ color: "red" }}>Có lỗi xảy ra: {error.message}</p>
        )}

        {profileData && (
          <Card
            style={{
              background: "#FFF",
              borderRadius: "8px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className={styles.infoRow}>
              <div className={styles.infoItem}>
                <label>Họ</label>
                <span>{profileData?.firstName || "Chưa có"}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Tên</label>
                <span>{profileData?.lastName || "Chưa có"}</span>
              </div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoItem}>
                <label>Email</label>
                <span>{profileData?.email || "Chưa có"}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Điện thoại</label>
                <span>{profileData?.phoneNumber || "Chưa có"}</span>
              </div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoItem}>
                <label>Địa chỉ</label>
                <span>
                  {defaultAddress
                    ? `${defaultAddress.street || ""}, ${defaultAddress.city || ""}, ${defaultAddress.country || ""}`
                    : "Chưa có địa chỉ"}
                </span>
              </div>
              <div className={styles.infoItem}>
                <label>Social Media</label>
                <span>{profileData?.socialMedia || "Chưa có"}</span>
              </div>
            </div>

            <motion.div>
              <Button
                type="primary"
                onClick={showModal}
                style={{
                  backgroundColor: "#01567f",
                  borderRadius: "5px",
                  marginTop: "20px",
                }}
              >
                Chỉnh sửa
              </Button>
            </motion.div>
          </Card>
        )}
      </motion.div>

      <Modal
        title="Chỉnh sửa thông tin tài khoản"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        width={690}
        cancelText="Hủy"
        okButtonProps={{
          style: { backgroundColor: "#01567f", borderColor: "#01567f" },
        }}
        cancelButtonProps={{
          style: { borderColor: "red", color: "red" },
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Form form={form} layout="vertical">
            <div style={{ display: "flex", gap: "20px" }}>
              <Form.Item
                label="Họ"
                name="firstName"
                rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
                style={{ flex: 1 }}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Tên"
                name="lastName"
                rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                style={{ flex: 1 }}
              >
                <Input />
              </Form.Item>
            </div>
            <div style={{ display: "flex", gap: "20px" }}>
              <Form.Item
                label="Điện thoại"
                name="phoneNumber"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^\d{10}$/,
                    message: "Số điện thoại phải bao gồm đúng 10 chữ số!",
                  },
                ]}
                style={{ flex: 1 }}
              >
                <Input maxLength={10} />
              </Form.Item>
              <Form.Item
                label="Social Media"
                name="socialMedia"
                style={{ flex: 1 }}
              >
                <Input />
              </Form.Item>
            </div>
          </Form>
        </motion.div>
      </Modal>
    </div>
  );
};

export default ProfileUser;
