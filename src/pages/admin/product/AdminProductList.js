import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Upload,
  Pagination,
  Select as AntSelect,
} from "antd";
import Swal from "sweetalert2";
import Filter from "../../../components/admin/filter/Filter";
import config from "../../../config";
import { PlusOutlined } from "@ant-design/icons";
import {
  addProduct,
  deleteProduct,
  getProductList,
  updateProduct,
} from "../../../services/api/productService";
import { getAllCategories } from "../../../services/api/categoryService";
import styles from "./index.module.scss";
import { addProductDetails } from "../../../services/api/productDetailService";
import { getInventoryList } from "../../../services/api/inventoryService";
import TableProduct from "../../../components/admin/table/TableProduct";
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
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [detailsForm] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
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
        setInventory(result);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách danh mục:", error);
      }
    };
    fetchInventory();
  }, []);

  const standardSort = ["name", "originalPrice"];

  const fetchData = useCallback(async () => {
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
    }
  }, [currentPage, limit]);

  const handleAddProduct = async (values) => {
    const { name, originalPrice, images, categoryId } = values;

    const productData = {
      name,
      originalPrice,
      categoryId,
      images:
        images && Array.isArray(images) ? images.map((file) => file.name) : [],
    };

    try {
      const res = await addProduct(productData);
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
        text: error.message,
        icon: "error",
      });
    }
  };

  const handleUpdateProduct = async (values) => {
    const { name, originalPrice, images, categoryId } = values;
    const formData = new FormData();
    formData.append("name", name);
    formData.append("originalPrice", originalPrice);
    formData.append("categoryId", categoryId);
    if (images && Array.isArray(images)) {
      images.forEach((fileObj) => {
        formData.append("images", fileObj.originFileObj);
      });
    }

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

    try {
      const res = await addProductDetails(
        currentProduct.id,
        productDetailsData,
      );
      if (res) {
        setDetailsModalVisible(false);
        detailsForm.resetFields();
        fetchData();
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
        text: error.message,
        icon: "error",
      });
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
      }
    }
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    editForm.setFieldsValue({
      name: product.name,
      originalPrice: product.originalPrice,
      categoryId: product?.category?.name,
      images: product.images.map((url, index) => ({
        uid: index,
        name: `image-${index}`,
        status: "done",
        url,
      })),
    });
    setEditModalVisible(true);
  };

  const handleAddDetails = (product) => {
    setCurrentProduct(product);
    setDetailsModalVisible(true);
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
                    { key: "name", placeholder: "Tìm kiếm theo tên sản phẩm" },
                    {
                      key: "originalPrice",
                      placeholder: "Tìm kiếm theo giá gốc",
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
              <TableProduct
                rows={validData}
                columns={[
                  {
                    key: "name",
                    header: "Tên sản phẩm",
                    render: (row) => row.name,
                  },
                  {
                    key: "finalPrice",
                    header: "Giá sản phẩm",
                    render: (row) => row.finalPrice,
                  },
                ]}
                setChecked={setCheckedRow}
                onEdit={handleEdit}
                onAddDetails={handleAddDetails}
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

          {/* Modal Thêm sản phẩm */}
          <Modal
            title="Thêm sản phẩm"
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
          >
            <Form form={form} layout="vertical" onFinish={handleAddProduct}>
              <Form.Item
                label="Hình ảnh"
                name="images"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  const fileList = Array.isArray(e) ? e : e?.fileList || [];
                  const files = fileList
                    .filter((file) => file.originFileObj)
                    .map((file) => file.originFileObj);
                  return files;
                }}
                rules={[{ required: true, message: "Vui lòng chọn hình ảnh!" }]}
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
                ]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Thêm sản phẩm
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
                  {categories.map((cat) => (
                    <AntSelect.Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </Form.Item>
              <Form.Item
                label="Giá sản phẩm"
                name="originalPrice"
                rules={[
                  { required: true, message: "Vui lòng nhập giá sản phẩm!" },
                ]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Cập nhật sản phẩm
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          {/* Modal Thêm chi tiết sản phẩm */}
          <Modal
            title="Thêm chi tiết sản phẩm"
            visible={detailsModalVisible}
            onCancel={() => {
              setDetailsModalVisible(false);
              detailsForm.resetFields();
            }}
            footer={null}
          >
            <Form
              form={detailsForm}
              layout="vertical"
              onFinish={handleAddProductDetails}
            >
              <Form.Item
                label="Kích thước"
                name="size"
                rules={[
                  { required: true, message: "Vui lòng chọn kích thước!" },
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
                rules={[
                  { required: true, message: "Vui lòng chọn chất liệu!" },
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
                  {inventory?.data?.map((item) => (
                    <AntSelect.Option key={item.id} value={item.id}>
                      {item.location}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Thêm chi tiết sản phẩm
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </main>
    </div>
  );
};

export default AdminProductList;
