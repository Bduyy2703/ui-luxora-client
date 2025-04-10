import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Input, Button, Pagination, Spin, Tooltip, Select, Table as AntTable } from "antd";
import Swal from "sweetalert2";
import Filter from "../../../components/admin/filter/Filter";
import config from "../../../config";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import styles from "./index.module.scss";
import { getAllUser, addUser, deleteUser } from "../../../services/api/userService";

const { Option } = Select;

const AdminUserList = () => {
  const [data, setData] = useState([]);
  const [validData, setValidData] = useState([]);
  const [filters, setFilters] = useState([]);
  const [checkedRow, setCheckedRow] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = config.LIMIT || 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllUser({ page: currentPage, limit });
      const items = res.data || res || [];
      console.log("Fetched users:", items);
      if (!Array.isArray(items)) {
        throw new Error("Dữ liệu trả về không phải là mảng");
      }
      setData(items);
      setValidData(items);
      setTotal(res.total || items.length);
    } catch (error) {
      console.error("Error fetching users:", error);
      setData([]);
      setValidData([]);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải danh sách người dùng.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  const handleAddUser = async (values) => {
    setLoading(true);
    try {
      const response = await addUser({
        username: values.username,
        email: values.email,
        password: values.password,
        role: values.role,
        phoneNumber: values.phoneNumber, // Thêm số điện thoại vào dữ liệu gửi lên API
      });

      setModalVisible(false);
      form.resetFields();
      fetchData();
      Swal.fire({
        title: "Thêm người dùng thành công!",
        text: response.message || "Người dùng đã được tạo thành công.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: error.response?.data?.message || "Không thể thêm người dùng.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    const confirm = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      setLoading(true);
      try {
        await deleteUser(id);
        Swal.fire({
          title: "Đã xóa!",
          text: "Người dùng đã được xóa thành công.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchData();
      } catch (error) {
        Swal.fire({
          title: "Lỗi!",
          text: "Đã xảy ra lỗi khi xóa người dùng.",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteMultiple = async () => {
    if (!checkedRow.length) {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng chọn ít nhất một người dùng để xóa.",
        icon: "warning",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa?",
      text: `Bạn đang xóa ${checkedRow.length} người dùng!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      setLoading(true);
      try {
        await Promise.all(checkedRow.map((id) => deleteUser(id)));
        Swal.fire({
          title: "Đã xóa!",
          text: "Người dùng đã được xóa thành công.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchData();
        setCheckedRow([]);
      } catch (error) {
        Swal.fire({
          title: "Lỗi!",
          text: "Đã xảy ra lỗi khi xóa người dùng.",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setFilters([
      { key: "role", header: "Vai trò", options: ["Tất cả", "Admin", "User"] },
      { key: "status", header: "Trạng thái", options: ["Tất cả", "Active", "Inactive"] },
    ]);
  }, []);

  const columns = [
    {
      title: "Tên người dùng",
      dataIndex: "username",
      key: "username",
      render: (text) => text || "N/A",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => text || "N/A",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (role && role.name ? role.name : "N/A"),
    },
    {
      title: "Số điện thoại",
      dataIndex: "profile",
      key: "phoneNumber",
      render: (profile) => (profile && profile.phoneNumber ? profile.phoneNumber : "N/A"),
    },
    {
      title: "Trạng thái xác thực",
      dataIndex: "isVerified",
      key: "isVerified",
      render: (isVerified) =>
        typeof isVerified === "boolean" ? (isVerified ? "Đã xác thực" : "Chưa xác thực") : "N/A",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (row) => (
        <div>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteUser(row?.id)}
              danger
              disabled={!row || !row.id}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="wrapper">
      <header className="admin-header">
        <div className="container">
          <h2>QUẢN LÝ NGƯỜI DÙNG</h2>
        </div>
      </header>
      <main className="main">
        <div className="container">
          <div className="card">
            <div className="card-header">
              <div className="card-tools">
                <Filter
                  filters={filters}
                  data={data}
                  validData={validData}
                  setValidData={setValidData}
                  standardSort={["username", "email"]}
                  searchFields={[
                    {
                      key: "username",
                      placeholder: "Tìm theo tên người dùng",
                    },
                  ]}
                />
              </div>
              <div className="card-btns">
                <Tooltip title="Thêm người dùng mới">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalVisible(true)}
                  >
                    Thêm
                  </Button>
                </Tooltip>
                <Tooltip title="Xóa các người dùng đã chọn">
                  <Button
                    danger
                    onClick={handleDeleteMultiple}
                    disabled={!checkedRow.length}
                    style={{ marginLeft: 8 }}
                  >
                    Xóa ({checkedRow.length})
                  </Button>
                </Tooltip>
              </div>
            </div>
            <div className="card-body">
              <Spin spinning={loading}>
                <AntTable
                  dataSource={validData}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                  rowSelection={{
                    type: "checkbox",
                    onChange: (selectedRowKeys) => setCheckedRow(selectedRowKeys),
                  }}
                />
              </Spin>
            </div>
            <div className={styles.pagination}>
              <Pagination
                current={currentPage}
                pageSize={limit}
                total={total}
                onChange={(page) => setCurrentPage(page)}
                showTotal={(total, range) =>
                  `Hiển thị ${range[0]}-${range[1]} trên tổng số ${total} người dùng`
                }
                showQuickJumper
              />
            </div>
          </div>

          <Modal
            title="Thêm người dùng"
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
            className={styles.addUserModal} // Thêm class để tùy chỉnh CSS
            width={600} // Tăng chiều rộng modal
          >
            <Form form={form} layout="vertical" onFinish={handleAddUser}>
              <Form.Item
                label="Tên người dùng"
                name="username"
                rules={[{ required: true, message: "Vui lòng nhập tên người dùng!" }]}
              >
                <Input placeholder="Nhập tên người dùng" />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
              <Form.Item
                label="Số điện thoại"
                name="phoneNumber"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^[0-9]{10,15}$/,
                    message: "Số điện thoại không hợp lệ! (Chỉ nhập số, 10-15 chữ số)",
                  },
                ]}
              >
                <Input placeholder="Nhập số điện thoại (VD: 0912345678)" />
              </Form.Item>
              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password placeholder="Nhập mật khẩu" />
              </Form.Item>
              <Form.Item
                label="Vai trò"
                name="role"
                rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
              >
                <Select placeholder="Chọn vai trò">
                  <Option value="ADMIN">Admin</Option>
                  <Option value="USER">User</Option>
                </Select>
              </Form.Item>
              <Form.Item className={styles.formActions}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Thêm người dùng
                </Button>
                <Button
                  className={styles.cancelButton}
                  onClick={() => setModalVisible(false)}
                >
                  Hủy
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </main>
    </div>
  );
};

export default AdminUserList;