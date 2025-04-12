import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Pagination,
  Table as AntTable,
  Tooltip,
  Image,
  InputNumber,
} from "antd";
import Swal from "sweetalert2";
import Filter from "../../../components/admin/filter/Filter";
import config from "../../../config";
import {
  EditOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  addInventory,
  getInventoryList,
  getInventoryById,
  updateInventory,
  deleteInventory,
  updateStock,
} from "../../../services/api/inventoryService";
import styles from "./index.module.scss";

const AdminInventoryList = () => {
  const [data, setData] = useState([]);
  const [validData, setValidData] = useState([]);
  const [filters, setFilters] = useState([]);
  const [checkedRow, setCheckedRow] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [currentInventory, setCurrentInventory] = useState(null);
  const [currentProductDetail, setCurrentProductDetail] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [stockForm] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = config.LIMIT || 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInventoryList();
      const items = res?.data || [];
      setData(items);
      setValidData(items);
      setTotal(res?.total || items.length || 0);
    } catch (error) {
      console.error("Error fetching inventories:", error);
      setData([]);
      setValidData([]);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải danh sách kho hàng.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddInventory = async (values) => {
    const { warehouseName, location } = values;
    const formData = new FormData();
    formData.append("warehouseName", warehouseName);
    formData.append("location", location);

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventory = async (values) => {
    const { warehouseName, location } = values;
    const formData = new FormData();
    formData.append("warehouseName", warehouseName);
    formData.append("location", location);

    setLoading(true);
    try {
      const res = await updateInventory(currentInventory.id, formData);
      if (res) {
        setEditModalVisible(false);
        editForm.resetFields();
        setCurrentInventory(null);
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
    } finally {
      setLoading(false);
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
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (inventory) => {
    setCurrentInventory(inventory);
    editForm.setFieldsValue({
      warehouseName: inventory.warehouseName,
      location: inventory.location,
    });
    setEditModalVisible(true);
  };

  const handleViewDetail = async (inventory) => {
    setLoading(true);
    try {
      const res = await getInventoryById(inventory.id);
      const inventoryDetail = res?.data?.inventory || {};
      const productImagesMap = res?.data?.productImagesMap || {};
      setCurrentInventory({
        ...inventoryDetail,
        productDetails: inventoryDetail.productDetails || [],
        productImagesMap,
      });
      setDetailModalVisible(true);
    } catch (error) {
      console.error("Error fetching inventory detail:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải chi tiết kho hàng.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (values) => {
    const { quantity } = values;
    const idDetails = currentProductDetail.id;
    const inventoryId = currentInventory.id;

    setLoading(true);
    try {
      const res = await updateStock(inventoryId, idDetails, quantity);
      if (res) {
        setStockModalVisible(false);
        stockForm.resetFields();
        setCurrentProductDetail(null);
        // Làm mới dữ liệu chi tiết kho hàng
        const inventoryRes = await getInventoryById(inventoryId);
        const inventoryDetail = inventoryRes?.data?.inventory || {};
        const productImagesMap = inventoryRes?.data?.productImagesMap || {};
        setCurrentInventory({
          ...inventoryDetail,
          productDetails: inventoryDetail.productDetails || [],
          productImagesMap,
        });
        Swal.fire({
          title: "Cập nhật số lượng thành công!",
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
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStockModal = (record) => {
    setCurrentProductDetail(record);
    setStockModalVisible(true);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const warehouseNames = [
      "Tất cả",
      ...new Set(data.map((item) => item.warehouseName)),
    ];
    const locations = [
      "Tất cả",
      ...new Set(data.map((item) => item.location?.split(",")[0]?.trim())),
    ];
    setFilters([
      { key: "warehouseName", header: "Tên kho", options: warehouseNames },
      { key: "location", header: "Địa chỉ", options: locations },
    ]);
  }, [data]);

  const standardSort = [
    { name: "Tên kho", type: "warehouseName" },
    { name: "Địa chỉ", type: "location" },
  ];

  const columns = [
    {
      title: "Tên kho",
      dataIndex: "warehouseName",
      key: "warehouseName",
      render: (text) => text || "N/A",
    },
    {
      title: "Địa chỉ",
      dataIndex: "location",
      key: "location",
      render: (text) => text || "N/A",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (row) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(row)}
              style={{ border: "none", color: "#1890ff" }}
            />
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<InfoCircleOutlined />}
              onClick={() => handleViewDetail(row)}
              style={{ border: "none", color: "#1890ff" }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const productColumns = [
    {
      title: "Hình ảnh",
      key: "image",
      render: (record) => {
        const productId = record.product?.id;
        const image =
          currentInventory?.productImagesMap?.[productId]?.[0]?.fileUrl;
        return image ? (
          <Image
            src={image}
            alt="Product"
            width={50}
            height={50}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span>Không có hình ảnh</span>
        );
      },
    },
    {
      title: "Tên sản phẩm",
      key: "name",
      render: (record) => {
        const name = record.product?.name || "N/A";
        const size = record.size || "N/A";
        const color = record.color || "N/A";
        const material = record.material || "N/A";
        return `${name} (Size: ${size}, Color: ${color}, Material: ${material})`;
      },
    },
    {
      title: "Giá",
      dataIndex: ["product", "finalPrice"],
      key: "finalPrice",
      render: (finalPrice) =>
        finalPrice ? `${parseFloat(finalPrice).toLocaleString()} VNĐ` : "N/A",
    },
    {
      title: "Số lượng còn",
      dataIndex: "stock",
      key: "stock",
      render: (text) => text || "0",
    },
    {
      title: "Số lượng đã bán",
      dataIndex: "sold",
      key: "sold",
      render: (text) => text || "0",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (record) => (
        <Tooltip title="Nhập thêm số lượng">
          <Button
            icon={<PlusOutlined />}
            onClick={() => handleOpenStockModal(record)}
            style={{ border: "none", color: "#1890ff" }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="wrapper">
      <header className="admin-header">
        <div className="container">
          <h2>QUẢN LÝ KHO HÀNG</h2>
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
                    { key: "location", placeholder: "Tìm theo địa chỉ" },
                  ]}
                />
              </div>
              <div className="card-btns">
                <Button type="primary" onClick={() => setModalVisible(true)}>
                  Thêm
                </Button>
                <Button
                  danger
                  onClick={handleDeleteData}
                  disabled={!checkedRow.length}
                  style={{ marginLeft: 8 }}
                >
                  Xóa ({checkedRow.length})
                </Button>
              </div>
            </div>
            <div className="card-body">
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
            </div>
            {total > limit && (
              <div className={styles.pagination}>
                <Pagination
                  current={currentPage}
                  pageSize={limit}
                  total={total}
                  onChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </div>

          {/* Add Inventory Modal */}
          <Modal
            title="Thêm kho hàng"
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
            className={styles.inventoryModal}
            width={600}
          >
            <Form form={form} layout="vertical" onFinish={handleAddInventory}>
              <Form.Item
                label="Tên kho hàng"
                name="warehouseName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên kho hàng!" },
                ]}
              >
                <Input placeholder="Nhập tên kho hàng" />
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
                <Input placeholder="Nhập địa chỉ kho hàng" />
              </Form.Item>
              <Form.Item className={styles.formActions}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Thêm kho hàng
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

          {/* Edit Inventory Modal */}
          <Modal
            title="Chỉnh sửa kho hàng"
            visible={editModalVisible}
            onCancel={() => {
              setEditModalVisible(false);
              setCurrentInventory(null);
              editForm.resetFields();
            }}
            footer={null}
            className={styles.inventoryModal}
            width={600}
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
                <Input placeholder="Nhập tên kho hàng" />
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
                <Input placeholder="Nhập địa chỉ kho hàng" />
              </Form.Item>
              <Form.Item className={styles.formActions}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Cập nhật kho hàng
                </Button>
                <Button
                  className={styles.cancelButton}
                  onClick={() => {
                    setEditModalVisible(false);
                    setCurrentInventory(null);
                    editForm.resetFields();
                  }}
                >
                  Hủy
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          {/* Detail Inventory Modal */}
          <Modal
            title="Chi tiết kho hàng"
            visible={detailModalVisible}
            onCancel={() => {
              setDetailModalVisible(false);
              setCurrentInventory(null);
            }}
            footer={null}
            className={styles.inventoryModal}
            width={800}
          >
            {currentInventory && (
              <div>
                <div className={styles.inventoryInfo}>
                  <h3>Thông tin kho hàng</h3>
                  <p>
                    <strong>Tên kho:</strong> {currentInventory.warehouseName}
                  </p>
                  <p>
                    <strong>Địa chỉ:</strong> {currentInventory.location}
                  </p>
                </div>
                <div className={styles.productList}>
                  <h3>Danh sách sản phẩm</h3>
                  <AntTable
                    dataSource={currentInventory.productDetails || []}
                    columns={productColumns}
                    rowKey={(record) => record.id}
                    pagination={false}
                    className={styles.productTable}
                  />
                </div>
              </div>
            )}
          </Modal>

          {/* Update Stock Modal */}
          <Modal
            title="Nhập thêm số lượng"
            visible={stockModalVisible}
            onCancel={() => {
              setStockModalVisible(false);
              setCurrentProductDetail(null);
              stockForm.resetFields();
            }}
            footer={null}
            className={styles.inventoryModal}
            width={400}
          >
            <Form
              form={stockForm}
              layout="vertical"
              onFinish={handleUpdateStock}
            >
              <Form.Item
                label="Số lượng (dương để nhập, âm để xuất)"
                name="quantity"
                rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Nhập số lượng"
                />
              </Form.Item>
              <Form.Item className={styles.formActions}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Cập nhật
                </Button>
                <Button
                  className={styles.cancelButton}
                  onClick={() => {
                    setStockModalVisible(false);
                    setCurrentProductDetail(null);
                    stockForm.resetFields();
                  }}
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

export default AdminInventoryList;
