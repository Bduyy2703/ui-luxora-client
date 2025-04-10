import { Select as AntSelect, Button, Form, Input, Modal } from "antd";
import { format } from "date-fns";
import React, { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  deleteProductDetails,
  updateProductDetails,
} from "../../../services/api/productDetailService";
import { getByIdProduct } from "../../../services/api/productService";
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
  rowLink,
  setChecked,
  isUser,
  onEdit,
  onAddDetails,
}) => {
  const nav = useNavigate();
  const [formattedRows, setFormattedRow] = useState([]);
  const [checkedState, setCheckedState] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [productDetails, setProductDetails] = useState({});
  const [editDetailModalVisible, setEditDetailModalVisible] = useState(false);
  const [currentDetail, setCurrentDetail] = useState(null);
  const [editDetailForm] = Form.useForm();

  const handleExpandRow = async (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

    if (!expandedRows[id] && !productDetails[id]) {
      try {
        const details = await getByIdProduct(id);
        setProductDetails((prev) => ({
          ...prev,
          [id]: details.productDetails || [],
        }));
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      }
    }
  };

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
        setProductDetails((prev) => ({
          ...prev,
          [currentDetail.id]: prev[currentDetail.id]?.map((detail) =>
            detail.id === currentDetail.id
              ? { ...detail, ...productDetailsData }
              : detail,
          ),
        }));
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

  const handleDeleteDetail = async (detail, productId) => {
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
        // Cập nhật lại danh sách productDetails sau khi xóa
        setProductDetails((prev) => ({
          ...prev,
          [productId]: prev[productId].filter((item) => item.id !== detail.id),
        }));
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
          </tr>
        </thead>
        <tbody>
          {formattedRows.length > 0 ? (
            formattedRows.map((row, index) => (
              <React.Fragment key={row.id}>
                <tr
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
                    }}
                  >
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddDetails(row);
                      }}
                      type="primary"
                      style={{
                        marginLeft: "10px",
                        cursor: "pointer",
                        width: "100px",
                      }}
                    >
                      Thêm chi tiết
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExpandRow(row.id);
                      }}
                      style={{ cursor: "pointer", marginLeft: "10px" }}
                    >
                      Xem chi tiết sản phẩm
                    </Button>
                  </td>
                </tr>
                {expandedRows[row.id] && (
                  <tr>
                    <td
                      colSpan={columns.length + (setChecked ? 2 : 1)}
                      style={{ padding: "10px", backgroundColor: "#f9f9f9" }}
                    >
                      {productDetails[row.id] ? (
                        productDetails[row.id].length > 0 ? (
                          <div>
                            {productDetails[row.id].map((detail, index) => (
                              <div>
                                <div
                                  key={index}
                                  className={styles.detail}
                                  onClick={() => handleEditDetail(detail)}
                                  style={{
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <div>
                                    {detail.description ||
                                      "Detail not available"}
                                  </div>
                                  <Button
                                    type="primary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteDetail(detail, row.id);
                                    }}
                                    style={{ marginLeft: "10px" }}
                                  >
                                    Xóa
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>Không có chi tiết sản phẩm.</p>
                        )
                      ) : (
                        <p>Đang lấy chi tiết sản phẩm...</p>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
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

      {/* Modal chỉnh sửa chi tiết sản phẩm */}
      <Modal
        title="Chỉnh sửa chi tiết sản phẩm"
        visible={editDetailModalVisible}
        onCancel={() => {
          setEditDetailModalVisible(false);
          editDetailForm.resetFields();
          setCurrentDetail(null);
        }}
        footer={null}
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
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật chi tiết sản phẩm
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default memo(Table);
