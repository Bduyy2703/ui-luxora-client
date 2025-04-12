import React, { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select as AntSelect,
  Button,
  Form,
  Input,
  Modal,
  Table as AntTable,
  Image,
  Tooltip,
} from "antd";
import { format } from "date-fns";
import Swal from "sweetalert2";
import {
  deleteProductDetails,
  updateProductDetails,
} from "../../../services/api/productDetailService";
import { getByIdProduct } from "../../../services/api/productService";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "./table.css";
import styles from "./table.module.scss";

const { Option } = AntSelect;

const ProductSize = {
  SMALL: "S",
  MEDIUM: "M",
  LARGE: "L",
  XLARGE: "XL",
};

const ProductColor = {
  GOLD: "Vàng",
  WHITE_GOLD: "Vàng trắng",
  ROSE_GOLD: "Vàng hồng",
  SILVER: "Bạc",
  PLATINUM: "Bạch kim",
};

const ProductMaterial = {
  GOLD: "Vàng",
  WHITE_GOLD: "Vàng trắng",
  ROSE_GOLD: "Vàng hồng",
  SILVER: "Bạc",
  PLATINUM: "Bạch kim",
  TITANIUM: "Titan",
  DIAMOND: "Kim cương",
  PEARL: "Ngọc trai",
  EMERALD: "Ngọc lục bảo",
  RUBY: "Hồng ngọc",
  SAPPHIRE: "Lam ngọc",
  JADE: "Ngọc bích",
};

const Table = ({
  rows,
  columns,
  setChecked,
  onEdit,
  onAddDetails,
  inventory,
  onViewDetails,
}) => {
  const nav = useNavigate();
  const [formattedRows, setFormattedRow] = useState([]);
  const [checkedState, setCheckedState] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [addDetailModalVisible, setAddDetailModalVisible] = useState(false);
  const [editDetailModalVisible, setEditDetailModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productDetails, setProductDetails] = useState([]);
  const [currentDetail, setCurrentDetail] = useState(null);
  const [editDetailForm] = Form.useForm();
  const [addDetailForm] = Form.useForm();

  useEffect(() => {
    if (!Array.isArray(rows)) {
      console.error("rows is not an array:", rows);
      setFormattedRow([]);
      setCheckedState([]);
      if (setChecked) setChecked([]);
      return;
    }

    setFormattedRow(
      rows.map((row) => ({
        ...row,
        createdAt: row.createdAt
          ? format(row.createdAt, "dd MMM yyyy, h:mm a")
          : "",
        startDate: row.startDate
          ? format(row.startDate, "dd MMM yyyy, h:mm a")
          : "",
        endDate: row.endDate ? format(row.endDate, "dd MMM yyyy, h:mm a") : "",
        product_isAvailable: row.product_isAvailable ? "Còn hàng" : "Hết hàng",
      })),
    );

    setCheckedState(new Array(rows.length).fill(false));
    if (setChecked) setChecked([]);
  }, [rows, setChecked]);

  const handleCheck = (e, index) => {
    e.stopPropagation();
    const newCheckedState = [...checkedState];
    newCheckedState[index] = e.target.checked;
    setCheckedState(newCheckedState);

    const checkedIds = formattedRows
      .filter((_, i) => newCheckedState[i])
      .map((row) => row.id);
    if (setChecked) setChecked(checkedIds);
  };

  const handleCheckAll = (e) => {
    const checked = e.target.checked;
    const newCheckedState = new Array(formattedRows.length).fill(checked);
    setCheckedState(newCheckedState);

    const allIds = checked ? formattedRows.map((row) => row.id) : [];
    if (setChecked) setChecked(allIds);
  };

  const formatPrice = (value) => {
    const num = Number(value);
    if (isNaN(num)) return "N/A";

    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(num);
    } catch (error) {
      const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${formatted} đ`;
    }
  };

  // Handle viewing product details in a modal
  const handleViewDetails = async (row) => {
    setCurrentProduct(row);
    try {
      const details = await getByIdProduct(row.id);
      setProductDetails(details.productDetails || []);
      setDetailModalVisible(true);
    } catch (error) {
      console.error("Failed to fetch product details:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải chi tiết sản phẩm.",
        icon: "error",
      });
    }
  };

  // Handle opening the "Thêm chi tiết" modal
  const handleOpenAddDetailModal = () => {
    setAddDetailModalVisible(true);
  };

  // Handle adding product details
  const handleAddProductDetails = async (values) => {
    try {
      await onAddDetails(currentProduct, values); // Gọi hàm onAddDetails từ props
      // Làm mới danh sách productDetails
      const details = await getByIdProduct(currentProduct.id);
      setProductDetails(details.productDetails || []);
      setAddDetailModalVisible(false);
      addDetailForm.resetFields();
      Swal.fire({
        title: "Thêm chi tiết sản phẩm thành công!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: error.message,
        icon: "error",
      });
    }
  };

  // Handle editing product details
  const handleEditDetail = (detail) => {
    setCurrentDetail(detail);
    editDetailForm.setFieldsValue({
      size: detail.size,
      color: detail.color,
      material: detail.material,
      stock: detail.stock,
      sold: detail.sold,
      length: detail.length,
      width: detail.width,
      height: detail.height,
      weight: detail.weight,
      care_instructions: detail.care_instructions,
      stone_size: detail.stone_size,
      stone_type: detail.stone_type,
      design_style: detail.design_style,
      description: detail.description,
    });
    setEditDetailModalVisible(true);
  };

  const handleUpdateProductDetails = async (values) => {
    const productDetailsData = {
      size: values.size,
      color: values.color,
      stock: Number(values.stock),
      sold: Number(values.sold) || 0,
      material: values.material,
      length: Number(values.length),
      width: Number(values.width),
      height: Number(values.height),
      weight: Number(values.weight),
      care_instructions: values.care_instructions,
      stone_size: values.stone_size,
      stone_type: values.stone_type,
      design_style: values.design_style,
      description: values.description,
    };

    try {
      const res = await updateProductDetails(
        currentDetail.id,
        productDetailsData,
      );
      if (res) {
        setEditDetailModalVisible(false);
        editDetailForm.resetFields();
        setCurrentDetail(null);
        // Làm mới danh sách productDetails
        const details = await getByIdProduct(currentProduct.id);
        setProductDetails(details.productDetails || []);
        Swal.fire({
          title: "Cập nhật chi tiết sản phẩm thành công!",
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
      });
    }
  };

  // Handle deleting product details
  const handleDeleteDetail = async (detail) => {
    const confirm = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa chi tiết này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteProductDetails(detail.id);
        const details = await getByIdProduct(currentProduct.id);
        setProductDetails(details.productDetails || []);
        Swal.fire({
          title: "Đã xóa!",
          text: "Chi tiết sản phẩm đã được xóa thành công.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          title: "Lỗi!",
          text: "Đã xảy ra lỗi khi xóa chi tiết sản phẩm.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const productDetailColumns = [
    {
      title: "Hình ảnh",
      key: "image",
      render: (record) => {
        const image = currentProduct?.images?.[0];
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
      render: (finalPrice) => (finalPrice ? formatPrice(finalPrice) : "N/A"),
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
        <div style={{ display: "flex", gap: 8 }}>
          <Tooltip title="Chỉnh sửa chi tiết">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditDetail(record)}
              style={{ border: "none", color: "#1890ff" }}
            />
          </Tooltip>
          <Tooltip title="Xóa chi tiết">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteDetail(record)}
              style={{ border: "none", color: "#ff4d4f" }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <table className="card-table">
        <thead>
          <tr>
            {setChecked && (
              <th className="col-checkbox">
                <input type="checkbox" onChange={handleCheckAll} />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
            {/* <th>Hành động</th> */}
          </tr>
        </thead>
        <tbody>
          {formattedRows.length > 0 ? (
            formattedRows.map((row, index) => (
              <tr
                key={row.id}
                className="table-row"
                onClick={() => onEdit(row)}
                style={{ cursor: "pointer" }}
              >
                {setChecked && (
                  <td
                    className="col-checkbox"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      name="ckb-data"
                      value={row.id}
                      checked={checkedState[index] || false}
                      onChange={(e) => handleCheck(e, index)}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key}>
                    {(() => {
                      const key = col.key;
                      const value = row[key];
                      if (key.includes("finalPrice")) {
                        return formatPrice(value);
                      }
                      return value;
                    })()}
                  </td>
                ))}
                <td
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 8,
                  }}
                >
                  {/* <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddDetails(row);
                    }}
                    type="primary"
                    style={{
                      cursor: "pointer",
                      width: "100px",
                    }}
                  >
                    Thêm chi tiết
                  </Button> */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(row);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    Xem chi tiết
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (setChecked ? 2 : 1)}>
                Không tìm thấy
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Xem chi tiết sản phẩm */}
      <Modal
        title="Chi tiết sản phẩm"
        visible={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setCurrentProduct(null);
          setProductDetails([]);
        }}
        footer={null}
        className={styles.productModal}
        width={900}
      >
        {currentProduct && (
          <div>
            <div className={styles.productInfo}>
              <h3>Thông tin sản phẩm</h3>
              <p>
                <strong>Tên sản phẩm:</strong> {currentProduct.name}
              </p>
              <p>
                <strong>Giá:</strong> {formatPrice(currentProduct.finalPrice)}
              </p>
            </div>
            <div className={styles.productDetailList}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <h3>Danh sách chi tiết</h3>
                <div>
                  <Button type="primary" onClick={handleOpenAddDetailModal}>
                    Thêm chi tiết
                  </Button>
                </div>
              </div>
              <AntTable
                dataSource={productDetails}
                columns={productDetailColumns}
                rowKey={(record) => record.id}
                pagination={false}
                className={styles.productDetailTable}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Thêm chi tiết sản phẩm (bên phải) */}
      <Modal
        title="Thêm chi tiết sản phẩm"
        visible={addDetailModalVisible}
        onCancel={() => {
          setAddDetailModalVisible(false);
          addDetailForm.resetFields();
        }}
        footer={null}
        className={`${styles.productModal} ${styles.sideModal}`}
        width={400}
      >
        <Form
          form={addDetailForm}
          layout="vertical"
          onFinish={handleAddProductDetails}
        >
          <Form.Item
            label="Kích thước"
            name="size"
            rules={[{ required: true, message: "Vui lòng chọn kích thước!" }]}
          >
            <AntSelect placeholder="Chọn kích thước">
              {Object.values(ProductSize).map((size) => (
                <AntSelect.Option key={size} value={size}>
                  {size}
                </AntSelect.Option>
              ))}
            </AntSelect>
          </Form.Item>
          <Form.Item
            label="Màu sắc"
            name="color"
            rules={[{ required: true, message: "Vui lòng chọn màu sắc!" }]}
          >
            <AntSelect placeholder="Chọn màu sắc">
              {Object.values(ProductColor).map((color) => (
                <AntSelect.Option key={color} value={color}>
                  {color}
                </AntSelect.Option>
              ))}
            </AntSelect>
          </Form.Item>
          <Form.Item
            label="Chất liệu"
            name="material"
            rules={[{ required: true, message: "Vui lòng chọn chất liệu!" }]}
          >
            <AntSelect placeholder="Chọn chất liệu">
              {Object.values(ProductMaterial).map((material) => (
                <AntSelect.Option key={material} value={material}>
                  {material}
                </AntSelect.Option>
              ))}
            </AntSelect>
          </Form.Item>
          <Form.Item
            label="Số lượng tồn kho"
            name="stock"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng tồn kho!" },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Số lượng đã bán" name="sold" initialValue={0}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Chiều dài (cm)" name="length">
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Chiều rộng (cm)" name="width">
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Chiều cao (cm)" name="height">
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Trọng lượng (g)" name="weight">
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Hướng dẫn bảo quản" name="care_instructions">
            <Input />
          </Form.Item>
          <Form.Item label="Kích thước đá" name="stone_size">
            <Input />
          </Form.Item>
          <Form.Item label="Loại đá" name="stone_type">
            <Input />
          </Form.Item>
          <Form.Item label="Phong cách thiết kế" name="design_style">
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label="Kho hàng"
            name="inventoryId"
            rules={[{ required: true, message: "Vui lòng chọn kho hàng!" }]}
          >
            <AntSelect placeholder="Chọn kho hàng">
              {inventory?.map((item) => (
                <AntSelect.Option key={item.id} value={item.id}>
                  {item.location}
                </AntSelect.Option>
              ))}
            </AntSelect>
          </Form.Item>
          <Form.Item className={styles.formActions}>
            <Button type="primary" htmlType="submit">
              Thêm chi tiết
            </Button>
            <Button
              className={styles.cancelButton}
              onClick={() => {
                setAddDetailModalVisible(false);
                addDetailForm.resetFields();
              }}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Sửa chi tiết sản phẩm (bên phải) */}
      <Modal
        title="Chỉnh sửa chi tiết sản phẩm"
        visible={editDetailModalVisible}
        onCancel={() => {
          setEditDetailModalVisible(false);
          editDetailForm.resetFields();
          setCurrentDetail(null);
        }}
        footer={null}
        className={`${styles.productModal} ${styles.sideModal}`}
        width={400}
      >
        <Form
          form={editDetailForm}
          layout="vertical"
          onFinish={handleUpdateProductDetails}
        >
          <Form.Item
            label="Kích thước"
            name="size"
            rules={[{ required: true, message: "Vui lòng chọn kích thước!" }]}
          >
            <AntSelect placeholder="Chọn kích thước">
              {Object.values(ProductSize).map((size) => (
                <AntSelect.Option key={size} value={size}>
                  {size}
                </AntSelect.Option>
              ))}
            </AntSelect>
          </Form.Item>
          <Form.Item
            label="Màu sắc"
            name="color"
            rules={[{ required: true, message: "Vui lòng chọn màu sắc!" }]}
          >
            <AntSelect placeholder="Chọn màu sắc">
              {Object.values(ProductColor).map((color) => (
                <AntSelect.Option key={color} value={color}>
                  {color}
                </AntSelect.Option>
              ))}
            </AntSelect>
          </Form.Item>
          <Form.Item
            label="Chất liệu"
            name="material"
            rules={[{ required: true, message: "Vui lòng chọn chất liệu!" }]}
          >
            <AntSelect placeholder="Chọn chất liệu">
              {Object.values(ProductMaterial).map((material) => (
                <AntSelect.Option key={material} value={material}>
                  {material}
                </AntSelect.Option>
              ))}
            </AntSelect>
          </Form.Item>
          <Form.Item
            label="Số lượng tồn kho"
            name="stock"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng tồn kho!" },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Số lượng đã bán" name="sold">
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Chiều dài (cm)" name="length">
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Chiều rộng (cm)" name="width">
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Chiều cao (cm)" name="height">
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Trọng lượng (g)" name="weight">
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Hướng dẫn bảo quản" name="care_instructions">
            <Input />
          </Form.Item>
          <Form.Item label="Kích thước đá" name="stone_size">
            <Input />
          </Form.Item>
          <Form.Item label="Loại đá" name="stone_type">
            <Input />
          </Form.Item>
          <Form.Item label="Phong cách thiết kế" name="design_style">
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item className={styles.formActions}>
            <Button type="primary" htmlType="submit">
              Cập nhật chi tiết
            </Button>
            <Button
              className={styles.cancelButton}
              onClick={() => {
                setEditDetailModalVisible(false);
                editDetailForm.resetFields();
                setCurrentDetail(null);
              }}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default memo(Table);
