import {
  Button,
  Form,
  Input,
  Modal,
  Pagination,
  Select,
  Table as AntTable,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import config from "../../../config";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryByProduct,
  updateCategory,
} from "../../../services/api/categoryService";
import styles from "./index.module.scss";

const { Option } = Select;

const AdminCategoryList = () => {
  const [data, setData] = useState([]);
  const [checkedRow, setCheckedRow] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [parentCategories, setParentCategories] = useState([]);
  const [form] = Form.useForm();
  const [validData, setValidData] = useState([]);
  const [pageData, setPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(config.LIMIT || 10);
  const [chooseRow, setChooseRow] = useState(null);
  const [selectedChildCategory, setSelectedChildCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const categories = await getAllCategories();
      const categoriesArray = Array.isArray(categories) ? categories : [];
      setData(categoriesArray);
      setParentCategories(categoriesArray);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
      if (error.response && error.response.status === 401) {
        Swal.fire({
          title: "Phiên đăng nhập hết hạn",
          text: "Vui lòng đăng nhập lại.",
          icon: "warning",
          confirmButtonText: "Đăng nhập",
        }).then(() => {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        });
      } else {
        Swal.fire({
          title: "Lỗi!",
          text: "Không thể lấy dữ liệu danh mục. Vui lòng thử lại.",
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProductsByChildCategory = useCallback(
    async (childCategoryId) => {
      try {
        const response = await getCategoryByProduct(childCategoryId);
        const products = response.data || [];
        const processedItems = products.map((item) => ({
          ...item,
          originalPrice: Number(item.originalPrice) || 0,
        }));
        setValidData(processedItems);
        setCurrentPage(1);
        const startIndex = 0;
        const endIndex = pageSize;
        setPageData(processedItems.slice(startIndex, endIndex));
      } catch (error) {
        // console.error();
      }
    },
    [pageSize],
  );

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setPageData(validData.slice(startIndex, endIndex));
  };

  const addCate = useCallback(
    async (values) => {
      try {
        const res = await createCategory({
          name: values.name,
          slug: values.slug,
          parentId: values.parentId || null,
        });
        if (res) {
          setModalVisible(false);
          form.resetFields();
          fetchData();
          Swal.fire({
            title: "Thêm thành công!",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          });
        }
      } catch (err) {
        console.error("Error in addCate:", err);
        Swal.fire({
          title: "Thêm không thành công!",
          text:
            err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    },
    [fetchData, form],
  );

  const editCate = useCallback(
    async (values) => {
      try {
        const res = await updateCategory(selectedCategory.id, {
          name: values.name,
          slug: values.slug,
          parentId: values.parentId || null,
        });
        if (res) {
          setModalVisible(false);
          setSelectedCategory(null);
          form.resetFields();
          fetchData();
          setModalMode("add");
          Swal.fire({
            title: "Cập nhật thành công!",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          });
        }
      } catch (err) {
        console.error("Error in editCate:", err);
        Swal.fire({
          title: "Cập nhật không thành công!",
          text:
            err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    },
    [fetchData, selectedCategory],
  );

  const handleDelete = useCallback(async () => {
    if (checkedRow.length === 0) {
      Swal.fire({
        title: "Chưa chọn danh mục!",
        text: "Vui lòng chọn ít nhất một danh mục để xóa.",
        icon: "warning",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      return;
    }

    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Bạn sẽ không thể khôi phục danh mục sau khi xóa!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Promise.all(
            checkedRow.map(async (id) => {
              await deleteCategory(id);
            }),
          );
          fetchData();
          setCheckedRow([]);
          Swal.fire({
            title: "Xóa thành công!",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          });
        } catch (err) {
          console.error("Error in handleDelete:", err);
          Swal.fire({
            title: "Xóa không thành công!",
            text:
              err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
            icon: "error",
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          });
        }
      }
    });
  }, [checkedRow, fetchData]);

  const handleParentCateClick = (rowId) => {
    setChooseRow(rowId);
    setSelectedChildCategory(null);
    setPageData([]);
    setValidData([]);
    setCurrentPage(1);
  };

  const handleChildCateClick = (childCategoryId) => {
    setSelectedChildCategory(childCategoryId);
    fetchProductsByChildCategory(childCategoryId);
  };

  const handleEditCategory = (category) => {
    setModalMode("edit");
    setSelectedCategory(category);
    form.setFieldsValue({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId || null,
    });
    setModalVisible(true);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = () => {
    if (isLoading) {
      Swal.fire({
        title: "Đang tải dữ liệu...",
        text: "Vui lòng chờ một chút trước khi mở modal.",
        icon: "info",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      return;
    }
    setModalMode("add");
    setSelectedCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setModalMode("add");
    setSelectedCategory(null);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    if (modalMode === "add") {
      addCate(values);
    } else {
      editCate(values);
    }
  };

  const getChildCategories = () => {
    if (!chooseRow) return [];
    const selectedCategory = data.find((cat) => cat.id === chooseRow);
    return selectedCategory ? selectedCategory.children || [] : [];
  };

  const parentColumns = [
    {
      title: "",
      key: "checkbox",
      width: 50,
      render: (_, record) => (
        <input
          type="checkbox"
          name="ckb-data"
          value={record.id}
          checked={checkedRow.includes(record.id)}
          onChange={() => {
            setCheckedRow((prev) =>
              prev.includes(record.id)
                ? prev.filter((id) => id !== record.id)
                : [...prev, record.id],
            );
          }}
        />
      ),
    },
    { title: "Tên danh mục", dataIndex: "name", key: "name" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleEditCategory(record)}
        />
      ),
    },
  ];

  // Cột cho bảng danh mục con
  const childColumns = [
    {
      title: "",
      key: "checkbox",
      width: 50,
      render: (_, record) => (
        <input
          type="checkbox"
          name="ckb-data"
          value={record.id}
          checked={checkedRow.includes(record.id)}
          onChange={() => {
            setCheckedRow((prev) =>
              prev.includes(record.id)
                ? prev.filter((id) => id !== record.id)
                : [...prev, record.id],
            );
          }}
        />
      ),
    },
    { title: "Tên danh mục", dataIndex: "name", key: "name" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleEditCategory(record)}
        />
      ),
    },
  ];

  // Cột cho bảng sản phẩm (không thêm cột Hành động vì bạn không yêu cầu, nhưng để sẵn nếu cần)
  const productColumns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    {
      title: "Giá gốc",
      dataIndex: "originalPrice",
      key: "originalPrice",
      render: (text) => `${text.toLocaleString()} VNĐ`,
    },
    {
      title: "Giá cuối",
      dataIndex: "finalPrice",
      key: "finalPrice",
      render: (text) => `${text.toLocaleString()} VNĐ`,
    },
    {
      title: "Danh mục",
      dataIndex: ["category", "name"],
      key: "category",
      render: (text) => text || "Không có danh mục",
    },
    // Nếu muốn thêm cột Hành động cho bảng sản phẩm, có thể thêm như sau:
    // {
    //   title: "Hành động",
    //   key: "actions",
    //   width: 100,
    //   render: (_, record) => (
    //     <Button
    //       type="text"
    //       icon={<EditOutlined />}
    //       onClick={() => handleEditProduct(record)} // Cần định nghĩa hàm handleEditProduct
    //     />
    //   ),
    // },
  ];

  const checkSlugUnique = (slug, currentCategoryId = null) => {
    const allSlugs = [];
    data.forEach((category) => {
      allSlugs.push(category.slug);
      if (category.children && category.children.length > 0) {
        category.children.forEach((child) => allSlugs.push(child.slug));
      }
    });

    if (currentCategoryId) {
      const currentCategory =
        data.find((cat) => cat.id === currentCategoryId) ||
        data
          .flatMap((cat) => cat.children)
          .find((cat) => cat.id === currentCategoryId);
      if (currentCategory && currentCategory.slug === slug) {
        return true;
      }
    }

    return !allSlugs.includes(slug);
  };

  return (
    <div className={styles.adminWrapper}>
      <div
        className={styles.container}
        style={{
          background:
            "linear-gradient(90deg, #f3e0bf, rgba(253, 252, 243, 0.7))",
          height: "70px",
          display: "flex",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <h2>QUẢN LÝ DANH MỤC</h2>
      </div>
      <div className={styles.main}>
        <div className={styles.container}>
          <div className={styles.verticalLayout}>
            {/* Bảng danh mục cha */}
            <div className={styles.section}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>DANH MỤC</h2>
                  <div>
                    <Button
                      type="primary"
                      onClick={handleOpenModal}
                      style={{ marginRight: 8 }}
                    >
                      Thêm
                    </Button>
                    <Button danger onClick={handleDelete}>
                      Xóa
                    </Button>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <AntTable
                    rowKey="id"
                    columns={parentColumns}
                    dataSource={data}
                    pagination={false}
                    loading={isLoading}
                    rowClassName={(record) =>
                      chooseRow === record.id ? "ant-table-row-selected" : ""
                    }
                    onRow={(record) => ({
                      onClick: () => {
                        handleParentCateClick(record.id);
                      },
                    })}
                    expandable={{
                      rowExpandable: () => false, // Tắt tính năng mở rộng hàng
                      showExpandColumn: false, // Ẩn cột chứa dấu "+" (quan trọng)
                      expandIcon: () => null, // Đảm bảo không hiển thị bất kỳ biểu tượng mở rộng nào
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bảng danh mục con */}
            <div className={styles.section}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>DANH MỤC CON</h2>
                </div>
                <div className={styles.cardBody}>
                  <AntTable
                    rowKey="id"
                    columns={childColumns}
                    dataSource={getChildCategories()}
                    pagination={false}
                    loading={isLoading}
                    rowClassName={(record) =>
                      selectedChildCategory === record.id
                        ? "ant-table-row-selected"
                        : ""
                    }
                    onRow={(record) => ({
                      onClick: () => {
                        handleChildCateClick(record.id);
                      },
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Bảng sản phẩm */}
            <div className={styles.section}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>DANH SÁCH SẢN PHẨM</h2>
                </div>
                <div className={styles.cardBody}>
                  <AntTable
                    rowKey="id"
                    columns={productColumns}
                    dataSource={pageData}
                    pagination={false}
                    locale={{ emptyText: "Không tìm thấy sản phẩm" }}
                  />
                </div>
                {validData.length > pageSize && (
                  <div className={styles.cardFooter}>
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={validData.length}
                      onChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal thêm/sửa danh mục */}
      <Modal
        title={modalMode === "add" ? "Thêm danh mục" : "Chỉnh sửa danh mục"}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tên danh mục"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>
          <Form.Item
            label="Slug"
            name="slug"
            rules={[
              { required: true, message: "Vui lòng nhập slug!" },
              {
                validator: async (_, value) => {
                  if (!value) return Promise.resolve();
                  const isUnique = checkSlugUnique(
                    value,
                    modalMode === "edit" ? selectedCategory?.id : null,
                  );
                  if (isUnique) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Slug đã tồn tại!"));
                },
              },
            ]}
          >
            <Input placeholder="Nhập slug" />
          </Form.Item>
          <Form.Item label="Danh mục cha" name="parentId">
            <Select placeholder="Chọn danh mục cha" allowClear>
              <Option value={null}>Không có danh mục cha</Option>
              {parentCategories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              key="cancel"
              onClick={handleCancel}
              style={{ marginRight: 8 }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {modalMode === "add" ? "Xác nhận" : "Cập nhật"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCategoryList;
