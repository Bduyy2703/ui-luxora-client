import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Pagination,
  Spin,
  Tooltip,
  Select,
  Table as AntTable,
  Tag,
} from "antd";
import Swal from "sweetalert2";
import Filter from "../../../components/admin/filter/Filter";
import config from "../../../config";
import {
  PlusOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import styles from "./index.module.scss";
import {
  getAllUser,
  addUser,
  deleteUser,
} from "../../../services/api/userService";

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
        roleName: values.role,
        phoneNumber: values.phoneNumber,
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
          text: "Người dùng này không thể bị xóa vì đã có giao dịch/hóa đơn trong hệ thống.",
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
          text: "Người dùng này không thể bị xóa vì đã có giao dịch/hóa đơn trong hệ thống.",
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
      {
        key: "status",
        header: "Trạng thái",
        options: ["Tất cả", "Active", "Inactive"],
      },
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
      align: "center",
    },
    {
      title: "Số điện thoại",
      dataIndex: "profile",
      key: "phoneNumber",
      render: (profile) =>
        profile && profile.phoneNumber ? profile.phoneNumber : "N/A",
      align: "center",
    },
    {
      title: "Tình trạng",
      dataIndex: "isVerified",
      key: "isVerified",
      render: (isVerified) => {
        if (isVerified === true) {
          return (
            <Tag
              style={{
                width: "100px",
                textAlign: "center",
              }}
              color="green"
            >
              Đã xác thực
            </Tag>
          );
        } else if (isVerified === false) {
          return (
            <Tag
              style={{
                width: "100px",
                textAlign: "center",
              }}
              color="red"
            >
              Chưa xác thực
            </Tag>
          );
        } else {
          return <Tag color="gray">N/A</Tag>;
        }
      },
      align: "center",
    },
    // {
    //   title: "Hành động",
    //   key: "actions",
    //   render: (row) => (
    //     <div>
    //       <Tooltip title="Xóa">
    //         <Button
    //           icon={<DeleteOutlined />}
    //           onClick={() => handleDeleteUser(row?.id)}
    //           danger
    //           disabled={!row || !row.id}
    //         />
    //       </Tooltip>
    //     </div>
    //   ),
    //   align: "center",
    // },
  ];

  const checkUsernameUnique = (username) => {
    return !data.some(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  };

  const checkEmailUnique = (email) => {
    return !data.some(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  };

  const checkPhoneNumberUnique = (phoneNumber) => {
    return !data.some((user) => user.profile?.phoneNumber === phoneNumber);
  };

  return (
    <div className="wrapper">
      <header className="admin-header">
        <div
          className="container"
          style={{
            background:
              "linear-gradient(90deg, #f3e0bf, rgba(253, 252, 243, 0.7))",
            height: "70px",
            display: "flex",
            alignItems: "center",
          }}
        >
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
                  standardSort={[
                    { name: "Tên người dùng", type: "username" },
                    { name: "Email", type: "email" },
                  ]}
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
                    onChange: (selectedRowKeys) =>
                      setCheckedRow(selectedRowKeys),
                  }}
                />
              </Spin>
            </div>
            {total > limit && (
              <div className={styles.pagination}>
                <Pagination
                  current={currentPage}
                  pageSize={limit}
                  total={total}
                  onChange={(page) => setCurrentPage(page)}
                  showQuickJumper
                />
              </div>
            )}
          </div>

          <Modal
            title="Thêm người dùng"
            visible={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              form.resetFields();
            }}
            footer={null}
            className={styles.addUserModal}
            width={600}
          >
            <Form form={form} layout="vertical" onFinish={handleAddUser}>
              <Form.Item
                label="Tên người dùng"
                name="username"
                rules={[
                  { required: true, message: "Vui lòng nhập tên người dùng!" },
                  {
                    validator: async (_, value) => {
                      if (!value) return Promise.resolve();
                      if (checkUsernameUnique(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Tên người dùng đã tồn tại!"),
                      );
                    },
                  },
                ]}
              >
                <Input placeholder="Nhập tên người dùng" />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                  {
                    validator: async (_, value) => {
                      if (!value) return Promise.resolve();
                      if (checkEmailUnique(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Email đã tồn tại!"));
                    },
                  },
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
                    pattern: /^[0-9]{10}$/,
                    message: "Số điện thoại phải đủ 10 chữ số!",
                  },
                  {
                    validator: async (_, value) => {
                      if (!value) return Promise.resolve();
                      if (checkPhoneNumberUnique(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Số điện thoại đã tồn tại!"),
                      );
                    },
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
                  Thêm
                </Button>
                <Button
                  className={styles.cancelButton}
                  onClick={() => {
                    setModalVisible(false);
                    form.resetFields();
                  }}
                  style={{ marginLeft: 8 }}
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
