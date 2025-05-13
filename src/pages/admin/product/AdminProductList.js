import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Upload,
  Pagination,
  Select as AntSelect,
  Image,
  Tooltip,
  Table as AntTable,
  Tag,
} from "antd";
import Swal from "sweetalert2";
import Filter from "../../../components/admin/filter/Filter";
import config from "../../../config";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  addProduct,
  deleteProduct,
  getProductList,
  updateProduct,
  getByIdProduct,
} from "../../../services/api/productService";
import { getAllCategories } from "../../../services/api/categoryService";
import {
  addProductDetails,
  getProductDetails,
  updateProductDetails,
  deleteProductDetails,
  getAllProductDetails,
} from "../../../services/api/productDetailService";
import { getInventoryList } from "../../../services/api/inventoryService";
import styles from "./index.module.scss";

const { Option, OptGroup } = AntSelect;

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

const AdminProductList = () => {
  const [data, setData] = useState([]);
  const [validData, setValidData] = useState([]);
  const [filters, setFilters] = useState([]);
  const [checkedRow, setCheckedRow] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [addDetailModalVisible, setAddDetailModalVisible] = useState(false);
  const [editDetailModalVisible, setEditDetailModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentProductDetails, setCurrentProductDetails] = useState([]);
  const [currentDetail, setCurrentDetail] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [addDetailForm] = Form.useForm();
  const [editDetailForm] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = config.LIMIT || 10;
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getAllCategories();
        setCategories(result);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const result = await getInventoryList();
        setInventory(result?.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách kho hàng:", error);
      }
    };
    fetchInventory();
  }, []);

  const standardSort = ["name", "originalPrice"];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProductList(currentPage, limit);
      const items = res?.data || [];
      const processedItems = items.map((item) => ({
        ...item,
        originalPrice: Number(item.originalPrice) || 0,
      }));
      setData(processedItems);
      setValidData(processedItems);
      setTotal(res?.total || items.length || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
      setData([]);
      setValidData([]);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải danh sách sản phẩm.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  const handleAddProduct = async (values) => {
    const { name, originalPrice, images, categoryId } = values;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("originalPrice", originalPrice);
    formData.append("categoryId", categoryId);

    if (images && Array.isArray(images)) {
      images.forEach((fileObj) => {
        if (fileObj.originFileObj) {
          formData.append("files", fileObj.originFileObj);
        }
      });
    }

    if (!images || images.length === 0) {
      Swal.fire({
        title: "Lỗi!",
        text: "Vui lòng chọn ít nhất một hình ảnh!",
        icon: "error",
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await addProduct(formData);
      if (res) {
        setModalVisible(false);
        form.resetFields();
        fetchData();
        Swal.fire({
          title: "Thêm sản phẩm thành công!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: error.message || "Không thể thêm sản phẩm!",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (values) => {
    const { name, originalPrice, images, categoryId } = values;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("originalPrice", originalPrice);
    formData.append("categoryId", categoryId);

    const keepFiles = [];
    if (images && Array.isArray(images)) {
      images.forEach((fileObj) => {
        if (fileObj.status === "done" && fileObj.fileId) {
          keepFiles.push({
            fileId: fileObj.fileId,
            fileName: fileObj.fileName,
            bucketName: fileObj.bucketName || "public",
          });
        } else if (fileObj.originFileObj) {
          formData.append("files", fileObj.originFileObj);
        }
      });
    }

    if (keepFiles.length > 0) {
      formData.append("keepFiles", JSON.stringify(keepFiles));
    }

    setLoading(true);
    try {
      const res = await updateProduct(currentProduct.id, formData);
      if (res) {
        setEditModalVisible(false);
        editForm.resetFields();
        setCurrentProduct(null);
        fetchData();
        Swal.fire({
          title: "Cập nhật sản phẩm thành công!",
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

  const handleAddProductDetails = async (values) => {
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
      inventoryId: values.inventoryId,
    };

    setLoading(true);
    try {
      const res = await addProductDetails(
        currentProduct.id,
        productDetailsData,
      );
      if (res) {
        const detailsRes = await getAllProductDetails(currentProduct.id);
        const newDetails = Array.isArray(detailsRes) ? detailsRes : [];
        setCurrentProductDetails(newDetails);

        const totalStock = newDetails[0]?.totalStock || 0;
        const totalSold = newDetails[0]?.totalSold || 0;

        setCurrentProduct((prev) => ({
          ...prev,
          totalStock,
          totalSold,
          images: newDetails[0]?.images || prev.images || [],
        }));

        await fetchData();

        setAddDetailModalVisible(false);
        addDetailForm.resetFields();

        if (!detailModalVisible) {
          setDetailModalVisible(true);
        }

        Swal.fire({
          title: "Thêm chi tiết sản phẩm thành công!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: error.message || "Không thể thêm chi tiết sản phẩm!",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
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
      inventoryId: values.inventoryId,
    };

    setLoading(true);
    try {
      const res = await updateProductDetails(
        currentDetail.id,
        productDetailsData,
      );
      if (res) {
        setEditDetailModalVisible(false);
        editDetailForm.resetFields();
        setCurrentDetail(null);

        const detailsRes = await getAllProductDetails(currentProduct.id);
        const newDetails = Array.isArray(detailsRes) ? detailsRes : [];
        setCurrentProductDetails(newDetails);

        const totalStock = newDetails[0]?.totalStock || 0;
        const totalSold = newDetails[0]?.totalSold || 0;

        setCurrentProduct((prev) => ({
          ...prev,
          totalStock,
          totalSold,
          images: newDetails[0]?.images || prev.images || [],
        }));

        await fetchData();

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
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProductDetails = async (detailId) => {
    const confirm = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa chi tiết này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      setLoading(true);
      try {
        await deleteProductDetails(detailId);

        const detailsRes = await getAllProductDetails(currentProduct.id);
        const newDetails = Array.isArray(detailsRes) ? detailsRes : [];
        setCurrentProductDetails(newDetails);

        const totalStock = newDetails[0]?.totalStock || 0;
        const totalSold = newDetails[0]?.totalSold || 0;

        setCurrentProduct((prev) => ({
          ...prev,
          totalStock,
          totalSold,
          images: newDetails[0]?.images || prev.images || [],
        }));

        await fetchData();

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
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteData = async () => {
    if (!Array.isArray(checkedRow) || checkedRow.length === 0) {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng chọn ít nhất một sản phẩm để xóa.",
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
        await Promise.all(checkedRow.map((id) => deleteProduct(id)));
        Swal.fire({
          title: "Đã xóa!",
          text: "Sản phẩm đã được xóa thành công.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchData();
        setCheckedRow([]);
      } catch (error) {
        Swal.fire({
          title: "Lỗi!",
          text: "Đã xảy ra lỗi khi xóa sản phẩm.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = async (product) => {
    setCurrentProduct(product);
    setLoading(true);
    try {
      const productDetails = await getByIdProduct(product.id);
      const images =
        productDetails.images?.map((img, index) => ({
          uid: img.fileId || index,
          name: img.fileName || `image-${index}`,
          status: "done",
          url: img.fileUrl,
          fileId: img.fileId,
          fileName: img.fileName,
          bucketName: img.bucketName || "public",
        })) || [];

      editForm.setFieldsValue({
        name: product.name,
        originalPrice: product.originalPrice,
        categoryId: product?.category?.id,
        images,
      });
    } catch (error) {
      console.error("Error fetching product details:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải thông tin sản phẩm.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
    setEditModalVisible(true);
  };

  const handleViewDetails = async (product) => {
    setLoading(true);
    try {
      const res = await getAllProductDetails(product.id);
      const details = Array.isArray(res) ? res : [];
      setCurrentProductDetails(details);

      const totalStock = details[0]?.totalStock || 0;
      const totalSold = details[0]?.totalSold || 0;

      setCurrentProduct({
        ...product,
        totalStock,
        totalSold,
        images: details[0]?.images || product.images || [],
      });

      setDetailModalVisible(true);
    } catch (error) {
      console.error("Error fetching product details:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải chi tiết sản phẩm.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDetailModal = () => {
    setAddDetailModalVisible(true);
  };

  const handleOpenEditDetailModal = (detail) => {
    setCurrentDetail(detail);
    editDetailForm.setFieldsValue({
      size: detail.size,
      color: detail.color,
      stock: detail.stock,
      sold: detail.sold,
      material: detail.material,
      length: detail.length,
      width: detail.width,
      height: detail.height,
      weight: detail.weight,
      care_instructions: detail.care_instructions,
      stone_size: detail.stone_size,
      stone_type: detail.stone_type,
      design_style: detail.design_style,
      description: detail.description,
      inventoryId: detail.inventoryId,
    });
    setEditDetailModalVisible(true);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setFilters([
      {
        key: "name",
        header: "Tên sản phẩm",
        options: ["Tất cả", ...new Set(data.map((item) => item.name))],
      },
      {
        key: "originalPrice",
        header: "Giá sản phẩm",
        options: [
          "Tất cả",
          ...new Set(data.map((item) => item.originalPrice?.toString())),
        ],
      },
    ]);
  }, [data]);

  const productDetailColumns = [
    {
      title: "Hình ảnh",
      key: "image",
      render: (record) => {
        const image = record.images?.[0];
        return image ? (
          <Image
            src={image.fileUrl}
            alt="Product"
            width={50}
            height={50}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span>Không có hình ảnh</span>
        );
      },
      width: 100,
      align: "center",
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
      width: 350,
    },
    {
      title: "Giá",
      dataIndex: ["product", "finalPrice"],
      key: "finalPrice",
      render: (finalPrice) =>
        finalPrice ? `${parseFloat(finalPrice).toLocaleString()} VNĐ` : "N/A",
      width: 120,
      align: "right",
    },
    {
      title: "Số lượng còn",
      dataIndex: "stock",
      key: "stock",
      render: (text) => text || "0",
      width: 150,
      align: "center",
    },
    {
      title: "Số lượng đã bán",
      dataIndex: "sold",
      key: "sold",
      render: (text) => text || "0",
      width: 150,
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "stock",
      key: "stock",
      render: (text) => {
        const stock = text || 0;
        let tagColor, tagText;

        if (stock === 0) {
          tagColor = "error";
          tagText = "Hết hàng";
        } else if (stock < 10) {
          tagColor = "warning";
          tagText = "Sắp hết hàng";
        } else {
          tagColor = "success";
          tagText = "Còn hàng";
        }

        return <Tag color={tagColor}>{tagText}</Tag>;
      },
      width: 150,
      align: "center",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Tooltip title="Chỉnh sửa chi tiết">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleOpenEditDetailModal(record)}
              style={{ border: "none", color: "#1890ff" }}
            />
          </Tooltip>
          <Tooltip title="Xóa chi tiết">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteProductDetails(record.id)}
              style={{ border: "none", color: "#ff4d4f" }}
            />
          </Tooltip>
        </div>
      ),
      width: 120,
    },
  ];

  const productColumns = [
    {
      title: "Hình ảnh",
      key: "images",
      render: (record) => {
        const image = record.images?.[0];
        return image ? (
          <Image
            src={image}
            alt="Product"
            width={100}
            height={100}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span>Không có hình ảnh</span>
        );
      },
      width: 150,
      align: "center",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 700,
    },
    {
      title: "Giá sản phẩm",
      dataIndex: "finalPrice",
      key: "finalPrice",
      render: (finalPrice) =>
        finalPrice ? `${parseFloat(finalPrice).toLocaleString()} VNĐ` : "N/A",
      width: 600,
      align: "right",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (record) => (
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ border: "none", color: "#1890ff" }}
            />
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<PlusOutlined />}
              onClick={() => handleViewDetails(record)}
              style={{ border: "none", color: "#52c41a" }}
            />
          </Tooltip>
        </div>
      ),
      align: "center",
      width: 150,
    },
  ];

  const handleOpenAddDetailFromTable = (product) => {
    setCurrentProduct(product);
    setAddDetailModalVisible(true);
  };

  const checkProductNameUnique = (name, currentProductId = null) => {
    if (currentProductId) {
      const currentProduct = data.find((item) => item.id === currentProductId);
      if (
        currentProduct &&
        currentProduct.name.toLowerCase() === name.toLowerCase()
      ) {
        return true;
      }
    }
    return !data.some((item) => item.name.toLowerCase() === name.toLowerCase());
  };

  const checkDetailUnique = (size, color, material, currentDetailId = null) => {
    if (currentDetailId) {
      const currentDetail = currentProductDetails.find(
        (detail) => detail.id === currentDetailId,
      );
      if (
        currentDetail &&
        currentDetail.size === size &&
        currentDetail.color === color &&
        currentDetail.material === material
      ) {
        return true;
      }
    }
    return !currentProductDetails.some(
      (detail) =>
        detail.size === size &&
        detail.color === color &&
        detail.material === material,
    );
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
                  standardSort={[
                    { name: "Tên sản phẩm", type: "name" },
                    { name: "Giá sản phẩm", type: "finalPrice" },
                  ]}
                  searchFields={[
                    { key: "name", placeholder: "Tìm kiếm theo tên sản phẩm" },
                    {
                      key: "finalPrice",
                      placeholder: "Tìm kiếm theo giá gốc",
                    },
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
                columns={productColumns}
                rowKey={(record) => record.id}
                loading={loading}
                rowSelection={{
                  selectedRowKeys: checkedRow,
                  onChange: (selectedRowKeys) => setCheckedRow(selectedRowKeys),
                }}
                pagination={false}
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

          <Modal
            title="Thêm sản phẩm"
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
            className={styles.productModal}
            width={600}
          >
            <Form form={form} layout="vertical" onFinish={handleAddProduct}>
              <Form.Item
                label="Hình ảnh"
                name="images"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) return e;
                  return e?.fileList || [];
                }}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất một hình ảnh!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || value.length === 0) {
                        return Promise.reject(
                          new Error("Vui lòng chọn ít nhất một hình ảnh!"),
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Upload
                  listType="picture"
                  beforeUpload={() => false}
                  multiple
                  accept="image/*"
                >
                  <Button icon={<PlusOutlined />}>Chọn ảnh</Button>
                </Upload>
              </Form.Item>
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                  {
                    validator: async (_, value) => {
                      if (!value) return Promise.resolve();
                      if (checkProductNameUnique(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Tên sản phẩm đã tồn tại!"),
                      );
                    },
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Danh mục"
                name="categoryId"
                rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
              >
                <AntSelect placeholder="Chọn danh mục">
                  {categories.map((cat) =>
                    cat.children.length > 0 ? (
                      <OptGroup key={cat.id} label={cat.name}>
                        {cat.children.map((child) => (
                          <Option key={child.id} value={child.id}>
                            {child.name}
                          </Option>
                        ))}
                      </OptGroup>
                    ) : null,
                  )}
                </AntSelect>
              </Form.Item>
              <Form.Item
                label="Giá sản phẩm"
                name="originalPrice"
                rules={[
                  { required: true, message: "Vui lòng nhập giá sản phẩm!" },
                  {
                    validator: (_, value) => {
                      if (!value || Number(value) > 0) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Giá sản phẩm phải lớn hơn 0!"),
                      );
                    },
                  },
                ]}
              >
                <Input type="number" min={0} step={1000} />
              </Form.Item>
              <Form.Item className={styles.formActions}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ marginRight: "12px" }}
                >
                  Thêm sản phẩm
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

          <Modal
            title="Chỉnh sửa sản phẩm"
            visible={editModalVisible}
            onCancel={() => {
              setEditModalVisible(false);
              setCurrentProduct(null);
              editForm.resetFields();
            }}
            footer={null}
            className={styles.productModal}
            width={600}
          >
            <Form
              form={editForm}
              layout="vertical"
              onFinish={handleUpdateProduct}
            >
              <Form.Item
                label="Hình ảnh"
                name="images"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) return e;
                  return e?.fileList;
                }}
              >
                <Upload listType="picture" beforeUpload={() => false} multiple>
                  <Button icon={<PlusOutlined />}>Chọn ảnh</Button>
                </Upload>
              </Form.Item>
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                  {
                    validator: async (_, value) => {
                      if (!value) return Promise.resolve();
                      if (checkProductNameUnique(value, currentProduct?.id)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Tên sản phẩm đã tồn tại!"),
                      );
                    },
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Danh mục"
                name="categoryId"
                rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
              >
                <AntSelect placeholder="Chọn danh mục">
                  {categories.map((cat) =>
                    cat.children && cat.children.length > 0 ? (
                      <OptGroup key={cat.id} label={cat.name}>
                        {cat.children.map((child) => (
                          <AntSelect.Option key={child.id} value={child.id}>
                            {child.name}
                          </AntSelect.Option>
                        ))}
                      </OptGroup>
                    ) : (
                      <AntSelect.Option key={cat.id} value={cat.id}>
                        {cat.name}
                      </AntSelect.Option>
                    ),
                  )}
                </AntSelect>
              </Form.Item>
              <Form.Item
                label="Giá sản phẩm"
                name="originalPrice"
                rules={[
                  { required: true, message: "Vui lòng nhập giá sản phẩm!" },
                  {
                    validator: (_, value) => {
                      if (!value || Number(value) > 0) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Giá sản phẩm phải lớn hơn 0!"),
                      );
                    },
                  },
                ]}
              >
                <Input type="number" min={0} step={1000} />
              </Form.Item>
              <Form.Item className={styles.formActions}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ marginRight: "12px" }}
                >
                  Cập nhật sản phẩm
                </Button>
                <Button
                  className={styles.cancelButton}
                  onClick={() => {
                    setEditModalVisible(false);
                    setCurrentProduct(null);
                    editForm.resetFields();
                  }}
                >
                  Hủy
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title="Chi tiết sản phẩm"
            visible={detailModalVisible}
            onCancel={() => {
              setDetailModalVisible(false);
              setCurrentProduct(null);
              setCurrentProductDetails([]);
            }}
            footer={null}
            className={styles.productModal}
            width={1200}
          >
            {currentProduct ? (
              <div>
                <div className={styles.productInfo}>
                  <h3>Thông tin sản phẩm</h3>
                  <p>
                    <strong>Tên sản phẩm:</strong> {currentProduct.name}
                  </p>
                  <p>
                    <strong>Giá:</strong>{" "}
                    {parseFloat(currentProduct.finalPrice).toLocaleString()} VNĐ
                  </p>
                  <p>
                    <strong>Tổng tồn kho:</strong>{" "}
                    {currentProduct.totalStock || 0}
                  </p>
                  <p>
                    <strong>Tổng đã bán:</strong>{" "}
                    {currentProduct.totalSold || 0}
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
                      <Button
                        type="primary"
                        onClick={handleOpenAddDetailModal}
                        style={{ marginRight: 8 }}
                      >
                        Thêm chi tiết
                      </Button>
                    </div>
                  </div>
                  <AntTable
                    dataSource={currentProductDetails}
                    columns={productDetailColumns}
                    rowKey={(record) => record.id}
                    pagination={false}
                    className={styles.productDetailTable}
                  />
                </div>
              </div>
            ) : (
              <p>Không có dữ liệu sản phẩm</p>
            )}
          </Modal>

          <Modal
            title={
              <div className={styles.modalTitle}>Thêm chi tiết sản phẩm</div>
            }
            visible={addDetailModalVisible}
            onCancel={() => {
              setAddDetailModalVisible(false);
              addDetailForm.resetFields();
            }}
            footer={null}
            className={`${styles.productModal} ${styles.addDetailModal}`}
            width={600}
            centered
            style={{ height: "80vh" }}
          >
            <div className={styles.modalContentWrapper}>
              <Form
                form={addDetailForm}
                layout="vertical"
                onFinish={handleAddProductDetails}
                className={styles.formContent}
              >
                <div className={styles.scrollableContent}>
                  <Form.Item
                    label="Kích thước"
                    name="size"
                    rules={[
                      { required: true, message: "Vui lòng chọn kích thước!" },
                      ({ getFieldValue }) => ({
                        validator: async (_, value) => {
                          const color = getFieldValue("color");
                          const material = getFieldValue("material");
                          if (value && color && material) {
                            if (checkDetailUnique(value, color, material)) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                "Tổ hợp Kích thước, Màu sắc, Chất liệu đã tồn tại!",
                              ),
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
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
                    rules={[
                      { required: true, message: "Vui lòng chọn màu sắc!" },
                      ({ getFieldValue }) => ({
                        validator: async (_, value) => {
                          const size = getFieldValue("size");
                          const material = getFieldValue("material");
                          if (size && value && material) {
                            if (checkDetailUnique(size, value, material)) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                "Tổ hợp Kích thước, Màu sắc, Chất liệu đã tồn tại!",
                              ),
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
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
                    rules={[
                      { required: true, message: "Vui lòng chọn chất liệu!" },
                      ({ getFieldValue }) => ({
                        validator: async (_, value) => {
                          const size = getFieldValue("size");
                          const color = getFieldValue("color");
                          if (size && color && value) {
                            if (checkDetailUnique(size, color, value)) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                "Tổ hợp Kích thước, Màu sắc, Chất liệu đã tồn tại!",
                              ),
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
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
                      {
                        required: true,
                        message: "Vui lòng nhập số lượng tồn kho!",
                      },
                      {
                        validator: (_, value) => {
                          if (value && Number(value) >= 0) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Số lượng tồn kho không được âm!"),
                          );
                        },
                      },
                    ]}
                  >
                    <Input type="number" min={0} />
                  </Form.Item>
                  <Form.Item
                    label="Số lượng đã bán"
                    name="sold"
                    initialValue={0}
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || Number(value) >= 0) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Số lượng đã bán không được âm!"),
                          );
                        },
                      },
                    ]}
                  >
                    <Input type="number" min={0} />
                  </Form.Item>
                  <Form.Item
                    label="Chiều dài (cm)"
                    name="length"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || Number(value) >= 0) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Chiều dài không được âm!"),
                          );
                        },
                      },
                    ]}
                  >
                    <Input type="number" min={0} />
                  </Form.Item>
                  <Form.Item
                    label="Chiều rộng (cm)"
                    name="width"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || Number(value) >= 0) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Chiều rộng không được âm!"),
                          );
                        },
                      },
                    ]}
                  >
                    <Input type="number" min={0} />
                  </Form.Item>
                  <Form.Item
                    label="Chiều cao (cm)"
                    name="height"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || Number(value) >= 0) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Chiều cao không được âm!"),
                          );
                        },
                      },
                    ]}
                  >
                    <Input type="number" min={0} />
                  </Form.Item>
                  <Form.Item
                    label="Trọng lượng (g)"
                    name="weight"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || Number(value) >= 0) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Trọng lượng không được âm!"),
                          );
                        },
                      },
                    ]}
                  >
                    <Input type="number" min={0} />
                  </Form.Item>
                  <Form.Item
                    label="Hướng dẫn bảo quản"
                    name="care_instructions"
                  >
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
                  <Form.Item
                    label="Mô tả"
                    name="description"
                    rules={[
                      {
                        max: 500,
                        message: "Mô tả không được vượt quá 500 ký tự!",
                      },
                    ]}
                  >
                    <Input.TextArea />
                  </Form.Item>
                  <Form.Item
                    label="Kho hàng"
                    name="inventoryId"
                    rules={[
                      { required: true, message: "Vui lòng chọn kho hàng!" },
                    ]}
                  >
                    <AntSelect placeholder="Chọn kho hàng">
                      {inventory?.map((item) => (
                        <AntSelect.Option key={item.id} value={item.id}>
                          {item.location}
                        </AntSelect.Option>
                      ))}
                    </AntSelect>
                  </Form.Item>
                </div>
                <div className={styles.modalFooter}>
                  <Form.Item className={styles.formActions}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      style={{ marginRight: "12px" }}
                    >
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
                </div>
              </Form>
            </div>
          </Modal>

          <Modal
            title={
              <div className={styles.modalTitle}>Sửa chi tiết sản phẩm</div>
            }
            visible={editDetailModalVisible}
            onCancel={() => {
              setEditDetailModalVisible(false);
              setCurrentDetail(null);
              editDetailForm.resetFields();
            }}
            footer={null}
            className={`${styles.productModal} ${styles.addDetailModal}`}
            width={600}
            centered
            style={{ height: "80vh" }}
          >
            <div className={styles.modalContentWrapper}>
              <Form
                form={editDetailForm}
                layout="vertical"
                onFinish={handleUpdateProductDetails}
                className={styles.formContent}
              >
                <div className={styles.scrollableContent}>
                  <Form.Item
                    label="Kích thước"
                    name="size"
                    rules={[
                      { required: true, message: "Vui lòng chọn kích thước!" },
                      ({ getFieldValue }) => ({
                        validator: async (_, value) => {
                          const color = getFieldValue("color");
                          const material = getFieldValue("material");
                          if (value && color && material) {
                            if (
                              checkDetailUnique(
                                value,
                                color,
                                material,
                                currentDetail?.id,
                              )
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                "Tổ hợp Kích thước, Màu sắc, Chất liệu đã tồn tại!",
                              ),
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
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
                    rules={[
                      { required: true, message: "Vui lòng chọn màu sắc!" },
                      ({ getFieldValue }) => ({
                        validator: async (_, value) => {
                          const size = getFieldValue("size");
                          const material = getFieldValue("material");
                          if (size && value && material) {
                            if (
                              checkDetailUnique(
                                size,
                                value,
                                material,
                                currentDetail?.id,
                              )
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                "Tổ hợp Kích thước, Màu sắc, Chất liệu đã tồn tại!",
                              ),
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
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
                    rules={[
                      { required: true, message: "Vui lòng chọn chất liệu!" },
                      ({ getFieldValue }) => ({
                        validator: async (_, value) => {
                          const size = getFieldValue("size");
                          const color = getFieldValue("color");
                          if (size && color && value) {
                            if (
                              checkDetailUnique(
                                size,
                                color,
                                value,
                                currentDetail?.id,
                              )
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                "Tổ hợp Kích thước, Màu sắc, Chất liệu đã tồn tại!",
                              ),
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
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
                      {
                        required: true,
                        message: "Vui lòng nhập số lượng tồn kho!",
                      },
                      {
                        validator: (_, value) => {
                          if (value && Number(value) >= 0) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Số lượng tồn kho không được âm!"),
                          );
                        },
                      },
                    ]}
                  >
                    <Input type="number" min={0} />
                  </Form.Item>
                  <Form.Item
                    label="Số lượng đã bán"
                    name="sold"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || Number(value) >= 0) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Số lượng đã bán không được âm!"),
                          );
                        },
                      },
                    ]}
                  >
                    <Input type="number" min={0} />
                  </Form.Item>
                  <Form.Item
                    label="Chiều dài (cm)"
                    name="length"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || Number(value) >= 0) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Chiều dài không được âm!"),
                          );
                        },
                      },
                    ]}
                  >
                    <Input type="number" min={0} />
                  </Form.Item>
                  <Form.Item
                    label="Chiều rộng (cm)"
                    name="width"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || Number(value) >= 0) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Chiều rộng không được âm!"),
                          );
                        },
                      },
                    ]}
                  >
                    <Input type="number" min={0} />
                  </Form.Item>
                  <Form.Item
                    label="Chiều cao (cm)"
                    name="height"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || Number(value) >= 0) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Chiều cao không được âm!"),
                          );
                        },
                      },
                    ]}
                  >
                    <Input type="number" min={0} />
                  </Form.Item>
                  <Form.Item
                    label="Trọng lượng (g)"
                    name="weight"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || Number(value) >= 0) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Trọng lượng không được âm!"),
                          );
                        },
                      },
                    ]}
                  >
                    <Input type="number" min={0} />
                  </Form.Item>
                  <Form.Item
                    label="Hướng dẫn bảo quản"
                    name="care_instructions"
                  >
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
                  <Form.Item
                    label="Mô tả"
                    name="description"
                    rules={[
                      {
                        max: 500,
                        message: "Mô tả không được vượt quá 500 ký tự!",
                      },
                    ]}
                  >
                    <Input.TextArea />
                  </Form.Item>
                  <Form.Item
                    label="Kho hàng"
                    name="inventoryId"
                    rules={[
                      { required: true, message: "Vui lòng chọn kho hàng!" },
                    ]}
                  >
                    <AntSelect placeholder="Chọn kho hàng">
                      {inventory?.map((item) => (
                        <AntSelect.Option key={item.id} value={item.id}>
                          {item.location}
                        </AntSelect.Option>
                      ))}
                    </AntSelect>
                  </Form.Item>
                </div>
                <div className={styles.modalFooter}>
                  <Form.Item className={styles.formActions}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      style={{ marginRight: "12px" }}
                    >
                      Cập nhật chi tiết
                    </Button>
                    <Button
                      className={styles.cancelButton}
                      onClick={() => {
                        setEditDetailModalVisible(false);
                        setCurrentDetail(null);
                        editDetailForm.resetFields();
                      }}
                    >
                      Hủy
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </div>
          </Modal>
        </div>
      </main>
    </div>
  );
};

export default AdminProductList;
