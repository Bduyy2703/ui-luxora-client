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

const AdminInventoryList = () => {
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
      const res = await getInventoryList();
      const items = res?.data || [];
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
          title: "Thêm kho hàng thành công!",
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
          title: "Cập nhật kho hàng thành công!",
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
        text: "Vui lòng chọn ít nhất một kho hàng để xóa.",
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
          text: "Kho hàng đã được xóa thành công.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchData();
        setCheckedRow([]);
      } catch (error) {
        Swal.fire({
          title: "Lỗi!",
          text: "Đã xảy ra lỗi khi xóa kho hàng.",
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
          <h2>QUẢN LÝ SẢN PHẨM</h2>
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
                    { key: "warehouseName", placeholder: "Tìm theo tên kho" },
                    { key: "location", placeholder: "Tìm theo vị trí" },
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
                    key: "warehouseName",
                    header: "Tên kho",
                    render: (row) => row.warehouseName,
                  },
                  {
                    key: "location",
                    header: "Địa chỉ",
                    render: (row) => row.location,
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
            title="Thêm sản phẩm"
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
          >
            <Form form={form} layout="vertical" onFinish={handleAddInventory}>
              <Form.Item
                label="Tên kho hàng"
                name="warehouseName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên kho hàngs!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Địa chỉ kho hàng"
                name="location"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập địa chỉ kho hàng!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Thêm kho hàng
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title="Chỉnh sửa sản phẩm"
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
                label="Tên kho hàng"
                name="warehouseName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên kho hàng!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Địa chỉ kho hàng"
                name="location"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập địa chỉ kho hàng!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Cập nhật kho hàng
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </main>
    </div>
  );
};

export default AdminInventoryList;
