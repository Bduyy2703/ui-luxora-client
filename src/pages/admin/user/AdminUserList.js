import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Input, Button, Upload, Pagination } from "antd";
import Swal from "sweetalert2";
import Table from "../../../components/admin/table/Table";
import Filter from "../../../components/admin/filter/Filter";
import config from "../../../config";
import { PlusOutlined } from "@ant-design/icons";

import styles from "./index.module.scss";
import {
  addInventory,
  getInventoryList,
  updateInventory,
  deleteInventory,
} from "../../../services/api/inventoryService";
import { getAllUser } from "../../../services/api/userService";

const AdminUserList = () => {
  const [data, setData] = useState([]);
  const [validData, setValidData] = useState([]);
  const [filters, setFilters] = useState([]);
  const [checkedRow, setCheckedRow] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = config.LIMIT || 10;

  const productColumns = [
    { key: "name", header: "Tên sản phẩm" },
    { key: "originalPrice", header: "Giá gốc" },
  ];

  const standardSort = ["name", "originalPrice"];

  const fetchData = useCallback(async () => {
    try {
      const res = await getAllUser();
      console.log("res", res);

      const items = res || [];
      setData(items);
      setValidData(items);
      setTotal(res?.total || items.length || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
      setData([]);
      setValidData([]);
    }
  }, [currentPage, limit]);

  const handleAddInventory = async (values) => {
    const { warehouseName, location } = values;
    const formData = new FormData();
    formData.append("warehouseName", warehouseName);
    formData.append("location", location);
    try {
      const res = await addInventory(formData);
      if (res) {
        setModalVisible(false);
        form.resetFields();
        fetchData();
        Swal.fire({
          title: "Thêm người dùng thành công!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: error.message,
        icon: "error",
        showConfirmButton: true,
      });
    }
  };

  const handleUpdateInventory = async (values) => {
    const { warehouseName, location } = values;
    const formData = new FormData();
    formData.append("warehouseName", warehouseName);
    formData.append("location", location);
    try {
      const res = await updateInventory(currentProduct.id, formData);
      if (res) {
        setEditModalVisible(false);
        editForm.resetFields();
        setCurrentProduct(null);
        fetchData();
        Swal.fire({
          title: "Cập nhật người dùng thành công!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: error.message,
        icon: "error",
        showConfirmButton: true,
      });
    }
  };

  const handleDeleteData = async () => {
    if (!Array.isArray(checkedRow) || checkedRow.length === 0) {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng chọn ít nhất một người dùng để xóa.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      try {
        await Promise.all(checkedRow.map((id) => deleteInventory(id)));
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
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleEdit = (inventory) => {
    setCurrentProduct(inventory);
    editForm.setFieldsValue({
      warehouseName: inventory.warehouseName,
      location: inventory.location,
    });
    setEditModalVisible(true);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
                  standardSort={standardSort}
                  searchFields={[
                    {
                      key: "warehouseName",
                      placeholder: "Tìm theo tên người dùng",
                    },
                  ]}
                />
              </div>
              <div className="card-btns">
                <Button
                  className="admin-btn"
                  onClick={() => setModalVisible(true)}
                >
                  Thêm
                </Button>
                <Button
                  className="admin-btn del-btn"
                  onClick={handleDeleteData}
                >
                  Xóa
                </Button>
              </div>
            </div>
            <div className="card-body">
              <Table
                rows={validData}
                columns={[
                  {
                    key: "username",
                    header: "Tên người dùng",
                    render: (row) => row.username,
                  },
                  {
                    key: "email",
                    header: "Email",
                    render: (row) => row.email,
                  },
                ]}
                setChecked={setCheckedRow}
                onEdit={handleEdit}
              />
            </div>
            <div className={styles.pagination}>
              <Pagination
                current={currentPage}
                pageSize={limit}
                total={total}
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
          </div>

          <Modal
            title="Thêm người dùng"
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
          >
            <Form form={form} layout="vertical" onFinish={handleAddInventory}>
              <Form.Item
                label="Tên người dùng"
                name="username"
                rules={[
                  { required: true, message: "Vui lòng nhập tên người dùng!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Thêm người dùng
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title="Chỉnh sửa người dùng"
            visible={editModalVisible}
            onCancel={() => {
              setEditModalVisible(false);
              setCurrentProduct(null);
              editForm.resetFields();
            }}
            footer={null}
          >
            <Form
              form={editForm}
              layout="vertical"
              onFinish={handleUpdateInventory}
            >
              <Form.Item
                label="Tên người dùng"
                name="username"
                rules={[
                  { required: true, message: "Vui lòng nhập tên người dùng!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập địa chỉ email!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Cập nhật người dùng
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
