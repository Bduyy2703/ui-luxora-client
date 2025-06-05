import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  Input as AntdInput,
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  notification,
  Pagination,
} from "antd";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  addAddresses,
  deleteAddresses,
  editAddresses,
  getAddresses,
  searchAddresses,
} from "../../../services/api/userService";
import styles from "./AddressesUser.module.scss";

const { confirm } = Modal;

const AddressesUser = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const addressesPerPage = 6;

  const addressesArray = Object.values(addresses);

  const fetchAddresses = async () => {
    try {
      const response = await getAddresses();
      setAddresses(response);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      notification.error({
        message: "Lấy địa chỉ thất bại",
        description: "Có lỗi xảy ra khi lấy danh sách địa chỉ.",
        duration: 3,
      });
    }
  };

  const handleSearch = async () => {
    try {
      const response = await searchAddresses(searchQuery);
      setAddresses(response);
      setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
    } catch (error) {
      console.error("Error searching addresses:", error);
      notification.error({
        message: "Tìm kiếm địa chỉ thất bại",
        description: "Có lỗi xảy ra khi tìm kiếm địa chỉ.",
        duration: 3,
      });
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const showModal = (type) => {
    setModalType(type);
    if (type === "add") {
      setStreet("");
      setCity("");
      setCountry("");
      setIsDefault(false);
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (!street || !city || !country) {
      notification.error({
        message: "Thêm địa chỉ thất bại",
        description: "Tất cả các trường đều phải được điền.",
        duration: 3,
      });
      return;
    }
    try {
      const email = localStorage.getItem("userEmail");
      await addAddresses(email, {
        street,
        city,
        country,
        isDefault,
      });
      fetchAddresses();
      setIsModalVisible(false);
      notification.success({
        message: "Thêm địa chỉ thành công",
        description: "Địa chỉ của bạn đã được thêm.",
        duration: 3,
      });
    } catch (error) {
      console.error("Error adding address:", error);
      notification.error({
        message: "Thêm địa chỉ thất bại",
        description: "Có lỗi xảy ra khi thêm địa chỉ. Vui lòng thử lại.",
        duration: 3,
      });
    }
  };

  const handleEdit = async (id) => {
    const address = addresses.find((addr) => addr.id === id);
    setStreet(address.street);
    setCity(address.city);
    setCountry(address.country);
    setIsDefault(address.isDefault || false);
    localStorage.setItem("addressId", id);
    showModal("edit");
  };

  const handleEditAddress = async () => {
    if (!street || !city || !country) {
      notification.error({
        message: "Sửa địa chỉ thất bại",
        description: "Tất cả các trường đều phải được điền.",
        duration: 3,
      });
      return;
    }
    const addressId = localStorage.getItem("addressId");
    try {
      await editAddresses(addressId, {
        street,
        city,
        country,
        isDefault,
      });
      fetchAddresses();
      setIsModalVisible(false);
      notification.success({
        message: "Sửa địa chỉ thành công",
        description: "Địa chỉ của bạn đã được cập nhật.",
        duration: 3,
      });
    } catch (error) {
      console.error("Error editing address:", error);
      notification.error({
        message: "Sửa địa chỉ thất bại",
        description: "Có lỗi xảy ra khi sửa địa chỉ.",
        duration: 3,
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa địa chỉ này không?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        return deleteAddresses(id)
          .then(() => {
            notification.success({
              message: "Xóa địa chỉ thành công",
              description: "Địa chỉ của bạn đã được xóa.",
              duration: 3,
            });
            fetchAddresses();
          })
          .catch((error) => {
            console.error("Error deleting address:", error);
            notification.error({
              message: "Xóa địa chỉ thất bại",
              description: "Có lỗi xảy ra khi xóa địa chỉ. Vui lòng thử lại.",
              duration: 3,
            });
          });
      },
      onCancel() {
        console.log("Hủy xóa");
      },
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const indexOfLastAddress = currentPage * addressesPerPage;
  const indexOfFirstAddress = indexOfLastAddress - addressesPerPage;
  const currentAddresses = addressesArray.slice(
    indexOfFirstAddress,
    indexOfLastAddress,
  );

  return (
    <div className={styles.profile}>
      <motion.div
        className={styles.profileUser}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <span className={styles.title}>ĐỊA CHỈ CỦA BẠN</span>
        <div className={styles.searchAndAdd}>
          <div className={styles.searchWrapper}>
            <AntdInput
              placeholder="Tìm kiếm địa chỉ"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Tìm kiếm địa chỉ"
            />
            <Button
              className={styles.searchButton}
              type="primary"
              onClick={handleSearch}
              aria-label="Tìm kiếm"
            >
              Tìm kiếm
            </Button>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="primary"
              onClick={() => showModal("add")}
              className={styles.addButton}
              aria-label="Thêm địa chỉ mới"
            >
              Thêm địa chỉ
            </Button>
          </motion.div>
        </div>
        <div className={styles.addressList}>
          <table className={`${styles.addressContent} ${styles.table}`}>
            <thead>
              <tr>
                <th>Địa chỉ</th>
                <th>Thành phố</th>
                <th>Quốc gia</th>
                <th>Mặc định</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentAddresses.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.emptyText}>
                    Không có địa chỉ nào.
                  </td>
                </tr>
              ) : (
                currentAddresses.map((address, index) => (
                  <motion.tr
                    key={address.id}
                    className={styles.tableRow}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <td>{address.street}</td>
                    <td>{address.city}</td>
                    <td>{address.country}</td>
                    <td>{address.isDefault ? "Có" : "Không"}</td>
                    <td className={styles.actionColumn}>
                      <motion.button
                        className={styles.editButton}
                        onClick={() => handleEdit(address.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Sửa địa chỉ ${address.street}`}
                      >
                        <EditOutlined className={styles.icon} />
                        Sửa
                      </motion.button>
                      <motion.button
                        className={styles.deleteButton}
                        onClick={() => showDeleteConfirm(address.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Xóa địa chỉ ${address.street}`}
                      >
                        <DeleteOutlined className={styles.icon} />
                        Xóa
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination
            current={currentPage}
            pageSize={addressesPerPage}
            total={addressesArray.length}
            onChange={handlePageChange}
            className={styles.pagination}
            showSizeChanger={false}
          />
        </div>
      </motion.div>

      <Modal
        title={modalType === "add" ? "THÊM ĐỊA CHỈ MỚI" : "SỬA ĐỊA CHỈ"}
        open={isModalVisible}
        onCancel={handleCancel}
        className={styles.modal}
        footer={[
          <Button
            key="back"
            onClick={handleCancel}
            className={styles.modalButton}
            aria-label="Hủy"
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={modalType === "add" ? handleOk : handleEditAddress}
            className={styles.modalButton}
            aria-label={modalType === "add" ? "Thêm địa chỉ" : "Sửa địa chỉ"}
          >
            {modalType === "add" ? "Thêm địa chỉ" : "Sửa địa chỉ"}
          </Button>,
        ]}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Form layout="vertical">
            <Form.Item
              label="Địa chỉ"
              required
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            >
              <Input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className={styles.input}
                aria-label="Địa chỉ"
              />
            </Form.Item>
            <Form.Item
              label="Thành phố"
              required
              rules={[{ required: true, message: "Vui lòng nhập thành phố!" }]}
            >
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={styles.input}
                aria-label="Thành phố"
              />
            </Form.Item>
            <Form.Item
              label="Quốc gia"
              required
              rules={[{ required: true, message: "Vui lòng nhập quốc gia!" }]}
            >
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={styles.input}
                aria-label="Quốc gia"
              />
            </Form.Item>
            <Form.Item>
              <Checkbox
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                aria-label="Đặt làm địa chỉ mặc định"
              >
                Đặt làm địa chỉ mặc định
              </Checkbox>
            </Form.Item>
          </Form>
        </motion.div>
      </Modal>
    </div>
  );
};

export default AddressesUser;
