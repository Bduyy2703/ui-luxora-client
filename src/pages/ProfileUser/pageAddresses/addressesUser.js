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
      });
    }
  };

  const handleSearch = async () => {
    try {
      const response = await searchAddresses(searchQuery);
      setAddresses(response);
    } catch (error) {
      console.error("Error searching addresses:", error);
      notification.error({
        message: "Tìm kiếm địa chỉ thất bại",
        description: "Có lỗi xảy ra khi tìm kiếm địa chỉ.",
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
      });
    } catch (error) {
      console.error("Error adding address:", error);
      notification.error({
        message: "Thêm địa chỉ thất bại",
        description: "Có lỗi xảy ra khi thêm địa chỉ. Vui lòng thử lại.",
      });
    }
  };

  const handleEdit = async (id) => {
    localStorage.setItem("addressId", id);
    const address = addresses.find((addr) => addr.id === id);
    setStreet(address.street);
    setCity(address.city);
    setCountry(address.country);
    setIsDefault(address.isDefault || false);
    showModal("edit");
  };

  const handleEditAddress = async () => {
    if (!street || !city || !country) {
      notification.error({
        message: "Sửa địa chỉ thất bại",
        description: "Tất cả các trường đều phải được điền.",
      });
      throw new Error("All fields are required");
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
    } catch (error) {
      console.error("Error editing address:", error);
      throw error;
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAddresses(id);
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa địa chỉ này không?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        return handleDelete(id)
          .then(() => {
            notification.success({
              message: "Xóa địa chỉ thành công",
              description: "Địa chỉ của bạn đã được xóa.",
            });
          })
          .catch(() => {
            notification.error({
              message: "Xóa địa chỉ thất bại",
              description: "Có lỗi xảy ra khi xóa địa chỉ. Vui lòng thử lại.",
            });
          });
      },
      onCancel() {
        console.log("Hủy xóa");
      },
    });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const addressesPerPage = 6;

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
      <div className={styles.profileUser}>
        <span className={styles.title}>ĐỊA CHỈ CỦA BẠN</span>
        <div className={styles.searchAndAdd}>
          <div className={styles.searchWrapper}>
            <AntdInput
              placeholder="Tìm kiếm địa chỉ"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <Button
              className={styles.searchButton}
              type="primary"
              onClick={handleSearch}
            >
              Tìm kiếm
            </Button>
          </div>
          <div>
            <Button
              type="primary"
              onClick={() => showModal("add")}
              className={styles.addButton}
            >
              Thêm địa chỉ
            </Button>
          </div>
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
                  <tr
                    key={index}
                    className={styles.tableRow}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td>{address.street}</td>
                    <td>{address.city}</td>
                    <td>{address.country}</td>
                    <td>{address.isDefault ? "Có" : "Không"}</td>
                    <td className={styles.actionColumn}>
                      <button
                        className={styles.editButton}
                        onClick={() => handleEdit(address.id)}
                      >
                        <EditOutlined className={styles.icon} />
                        Sửa
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => showDeleteConfirm(address.id)}
                      >
                        <DeleteOutlined className={styles.icon} />
                        Xóa
                      </button>
                    </td>
                  </tr>
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
          />
        </div>
      </div>

      {modalType === "add" && (
        <Modal
          title="THÊM ĐỊA CHỈ MỚI"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          className={styles.modal}
          footer={[
            <Button
              key="back"
              onClick={handleCancel}
              className={styles.modalButton}
            >
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleOk}
              className={styles.modalButton}
            >
              Thêm địa chỉ
            </Button>,
          ]}
        >
          <Form layout="vertical">
            <Form.Item label="Địa chỉ" required>
              <Input
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Thành phố" required>
              <Input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Quốc gia" required>
              <Input
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Checkbox
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              >
                Đặt làm địa chỉ mặc định
              </Checkbox>
            </Form.Item>
          </Form>
        </Modal>
      )}

      {modalType === "edit" && (
        <Modal
          title="SỬA ĐỊA CHỈ"
          visible={isModalVisible}
          onCancel={handleCancel}
          className={styles.modal}
          footer={[
            <Button
              key="back"
              onClick={handleCancel}
              className={styles.modalButton}
            >
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={async () => {
                try {
                  await handleEditAddress();
                  notification.success({
                    message: "Sửa địa chỉ thành công",
                    description: "Địa chỉ của bạn đã được cập nhật.",
                  });
                } catch (error) {
                  notification.error({
                    message: "Sửa địa chỉ thất bại",
                    description: "Có lỗi xảy ra khi sửa địa chỉ.",
                  });
                }
              }}
              className={styles.modalButton}
            >
              Sửa địa chỉ
            </Button>,
          ]}
        >
          <Form layout="vertical">
            <Form.Item label="Địa chỉ" required>
              <Input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Thành phố" required>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </Form.Item>
            <Form.Item label="Quốc gia" required>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Checkbox
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              >
                Đặt làm địa chỉ mặc định
              </Checkbox>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default AddressesUser;
