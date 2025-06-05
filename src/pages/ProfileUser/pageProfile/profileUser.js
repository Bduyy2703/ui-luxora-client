import { useEffect, useState } from "react";
import { defineMessages } from "react-intl";
import { getProfile } from "../../../services/api/userService";
import { Modal, Form, Input, Button, Card, notification } from "antd";
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

  const showModal = () => {
    form.setFieldsValue({
      firstName: profileData?.firstName || "",
      lastName: profileData?.lastName || "",
      phoneNumber: profileData?.phoneNumber || "",
      socialMedia: profileData?.socialMedia || "",
    });
    setIsModalVisible(true);
  };

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
        <span className={styles.title}>THÔNG TIN TÀI KHOẢN</span>

        {loading && <p className={styles.loading}>Đang tải...</p>}
        {error && (
          <p className={styles.error}>Có lỗi xảy ra: {error.message}</p>
        )}

        {profileData && (
          <Card className={styles.card}>
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

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="primary"
                onClick={showModal}
                className={styles.editButton}
                aria-label="Chỉnh sửa thông tin tài khoản"
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
          className: styles.okButton,
        }}
        cancelButtonProps={{
          className: styles.cancelButton,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Form form={form} layout="vertical">
            <div className={styles.formRow}>
              <Form.Item
                label="Họ"
                name="firstName"
                rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
                style={{ flex: 1 }}
              >
                <Input className={styles.input} />
              </Form.Item>
              <Form.Item
                label="Tên"
                name="lastName"
                rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                style={{ flex: 1 }}
              >
                <Input className={styles.input} />
              </Form.Item>
            </div>
            <div className={styles.formRow}>
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
                <Input className={styles.input} maxLength={10} />
              </Form.Item>
              <Form.Item
                label="Social Media"
                name="socialMedia"
                style={{ flex: 1 }}
              >
                <Input className={styles.input} />
              </Form.Item>
            </div>
          </Form>
        </motion.div>
      </Modal>
    </div>
  );
};

export default ProfileUser;
