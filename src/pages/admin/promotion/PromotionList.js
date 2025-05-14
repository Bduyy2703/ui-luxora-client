import {
  Table as AntTable,
  Button,
  Card,
  DatePicker,
  Form,
  Image,
  Input,
  InputNumber,
  List,
  message,
  Modal,
  Pagination,
  Select,
  Switch,
  Tabs,
  Tag,
} from "antd";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Filter from "../../../components/admin/filter/Filter";
import config from "../../../config";
import { getAllCategories } from "../../../services/api/categoryService";
import {
  getByIdProduct,
  getProductList,
} from "../../../services/api/productService";
import {
  addCategoryToSale,
  addProductToSale,
  createSale,
  deleteSale,
  getAllSales,
  getNotiUserId,
  getSaleActive,
  getSaleById,
  getSaleCategories,
  getSaleProduct,
  removeCategoryFromSale,
  removeProductFromSale,
  updateSale,
} from "../../../services/api/promotionService";
import styles from "./index.module.scss";
import dayjs from "../../../components/common/layout/dayjs-setup";

const { Option, OptGroup } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const PromotionList = () => {
  const [data, setData] = useState([]);
  const [validData, setValidData] = useState([]);
  const [filters, setFilters] = useState([]);
  const [checkedRow, setCheckedRow] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isActiveFilter, setIsActiveFilter] = useState(undefined);
  const [dateRangeFilter, setDateRangeFilter] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState(null);
  const [currentPromotionId, setCurrentPromotionId] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [activeSale, setActiveSale] = useState(null);
  const [saleProducts, setSaleProducts] = useState([]);
  const [saleCategories, setSaleCategories] = useState([]);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [productForm] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [productList, setProductList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [isGlobalSale, setIsGlobalSale] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [productsForModal, setProductsForModal] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [seoData, setSeoData] = useState(null);
  const [categoriesForModal, setCategoriesForModal] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const limit = config.LIMIT || 10;

  const standardSort = ["name", "startDate"];

  const renderProductImage = (images) => {
    const imageUrl = images?.[0];
    const src =
      typeof imageUrl === "string"
        ? imageUrl
        : imageUrl?.fileUrl || "/fallback-image.jpg";
    return (
      <Image
        src={src}
        alt="Product Image"
        width={50}
        height={50}
        style={{ objectFit: "cover" }}
        fallback="/fallback-image.jpg"
        onError={() => console.error("Failed to load image:", src)}
      />
    );
  };

  // Tải danh sách sản phẩm và danh mục
  useEffect(() => {
    const fetchProductList = async () => {
      try {
        const products = await getProductList(1, 100);
        setProductList(products?.data || []);
      } catch (error) {
        message.error("Không thể tải danh sách sản phẩm!");
      }
    };

    const fetchCategoryList = async () => {
      try {
        const categories = await getAllCategories();
        setCategoryList(categories || []);
      } catch (error) {
        message.error("Không thể tải danh sách danh mục!");
      }
    };

    fetchProductList();
    fetchCategoryList();
  }, []);

  // Tải danh sách chương trình khuyến mãi
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query = {
        page: currentPage,
        limit,
        isActive: isActiveFilter,
      };
      const res = await getAllSales(query);
      if (res.error) throw new Error(res.error);

      let items = res || [];
      if (dateRangeFilter.length === 2) {
        const [startDate, endDate] = dateRangeFilter;
        items = items.filter((item) => {
          const start = new Date(item.startDate);
          return start >= startDate && start <= endDate;
        });
      }

      setData(items);
      setValidData(items);
      setTotal(res.total || 0);
    } catch (error) {
      setData([]);
      setValidData([]);
      Swal.fire({
        title: "Lỗi!",
        text:
          error.message || "Không thể tải danh sách chương trình khuyến mãi.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, isActiveFilter, dateRangeFilter]);

  const fetchStatistics = useCallback(async () => {
    try {
      const [activeSaleRes, productsRes, categoriesRes] = await Promise.all([
        getSaleActive(),
        getSaleProduct(),
        getSaleCategories(),
      ]);

      setActiveSale(activeSaleRes?.sale || null);
      setSaleProducts(productsRes?.products || []);
      setSaleCategories(categoriesRes?.categories || []);
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: error.message || "Không thể tải dữ liệu thống kê.",
        icon: "error",
      });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Cập nhật filters
  useEffect(() => {
    setFilters([
      {
        key: "name",
        header: "Tên chương trình",
        options: [
          "Tất cả",
          ...new Set(data.map((item) => item.name).filter(Boolean)),
        ],
      },
      {
        key: "startDate",
        header: "Ngày bắt đầu",
        options: [
          "Tất cả",
          ...new Set(
            data
              .map((item) => new Date(item.startDate).toLocaleDateString())
              .filter(Boolean),
          ),
        ],
      },
    ]);
  }, [data]);

  const handleDeletePromotion = async () => {
    if (!checkedRow.length) {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng chọn ít nhất một chương trình để xóa.",
        icon: "warning",
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
        await Promise.all(checkedRow.map((id) => deleteSale(id)));
        Swal.fire({
          title: "Đã xóa!",
          text: "Chương trình khuyến mãi đã được xóa thành công.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchData();
        setCheckedRow([]);
      } catch (error) {
        Swal.fire({
          title: "Lỗi!",
          text: error.message || "Đã xảy ra lỗi khi xóa chương trình.",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddOrEditPromotion = async (values) => {
    try {
      const discountAmount = Number(values.discountAmount);
      if (isNaN(discountAmount) || discountAmount < 0) {
        throw new Error("Số tiền giảm giá phải lớn hơn hoặc bằng 0!");
      }

      const payload = {
        name: values.name,
        discountAmount: discountAmount,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        isActive: editMode ? values.isActive : true,
      };

      if (editMode) {
        await updateSale(currentPromotion.id, payload);
        message.success("Cập nhật chương trình khuyến mãi thành công!");
      } else {
        payload.isGlobalSale = values.isGlobalSale;

        if (!values.isGlobalSale) {
          const hasCategory = !!values.categoryId;
          const hasProducts = values.products && values.products.length > 0;

          if (!hasCategory && !hasProducts) {
            throw new Error(
              "Vui lòng chọn ít nhất một danh mục hoặc sản phẩm!",
            );
          }

          if (hasCategory) {
            payload.categories = [values.categoryId];
          }
          if (hasProducts) {
            payload.products = values.products;
          }
        }

        await createSale(payload);
        message.success("Tạo chương trình khuyến mãi thành công!");
      }

      setModalVisible(false);
      form.resetFields();
      setIsGlobalSale(false);
      fetchData();
    } catch (error) {
      message.error(
        error.message || "Đã xảy ra lỗi khi lưu chương trình khuyến mãi.",
      );
    }
  };

  const openModal = (promotion = null) => {
    if (promotion) {
      setEditMode(true);
      setCurrentPromotion(promotion);
      const discountAmount = Number(promotion.discountAmount);
      setIsGlobalSale(promotion.isGlobalSale || false);

      const categoryIds = Array.isArray(promotion.categoryStrategySales)
        ? promotion.categoryStrategySales
            .map((item) => item.category?.id)
            .filter(Boolean)
        : [];

      const productIds = Array.isArray(promotion.productStrategySales)
        ? promotion.productStrategySales
            .map((item) => item.product?.id)
            .filter(Boolean)
        : [];

      form.setFieldsValue({
        name: promotion.name,
        discountAmount: isNaN(discountAmount) ? 0 : discountAmount,
        isGlobalSale: promotion.isGlobalSale,
        dateRange: [dayjs(promotion.startDate), dayjs(promotion.endDate)],
        categoryId: categoryIds[0] || null, // Chỉ lấy danh mục đầu tiên khi sửa
        products: productIds,
        isActive: promotion.isActive || false,
      });
    } else {
      setEditMode(false);
      setCurrentPromotion(null);
      setIsGlobalSale(false);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleViewDetails = async (promotion) => {
    try {
      const saleDetails = await getSaleById(promotion.id);
      if (saleDetails.isGlobalSale) {
        const productsResponse = await getProductList(1, 1000);
        const allProductsData = productsResponse?.data || [];

        const formattedProducts = allProductsData.map((product) => ({
          id: product.id,
          product: {
            id: product.id,
            name: product.name,
            originalPrice: product.originalPrice,
            finalPrice: product.finalPrice,
            images: product.images || [],
          },
        }));
        setAllProducts(formattedProducts);
      } else {
        const productsWithImages = await Promise.all(
          (saleDetails?.productStrategySales || []).map(async (item) => {
            const productDetails = await getByIdProduct(item?.product?.id);
            return {
              ...item.product,
              images: productDetails.images || [],
            };
          }),
        );

        saleDetails.productStrategySales = saleDetails.productStrategySales.map(
          (item, index) => ({
            ...item,
            product: productsWithImages[index],
          }),
        );
        setAllProducts([]);
      }

      setCurrentPromotion(saleDetails);
      setCurrentPromotionId(Number(saleDetails?.id));
      setSeoData(null); // Reset seoData khi mở modal
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Không thể tải chi tiết chương trình khuyến mãi.");
    }
  };

  const handleFetchSeoData = async () => {
    if (!currentPromotion?.id) {
      message.error("Không tìm thấy ID chương trình khuyến mãi!");
      return;
    }

    try {
      const seoResponse = await getNotiUserId(currentPromotion.id);
      setSeoData(seoResponse);
    } catch (error) {
      message.error(error.message || "Không thể lấy thông tin SEO.");
      setSeoData(null);
    }
  };

  const handleAddProduct = async () => {
    if (!selectedProductIds.length) {
      message.error("Vui lòng chọn ít nhất một sản phẩm!");
      return;
    }

    try {
      for (const productId of selectedProductIds) {
        const parsedProductId = parseInt(productId, 10);
        if (isNaN(parsedProductId)) {
          throw new Error(`ID sản phẩm không hợp lệ: ${productId}`);
        }
        await addProductToSale(currentPromotion.id, {
          productId: parsedProductId,
        });
      }
      message.success("Thêm sản phẩm thành công!");
      setProductModalVisible(false);
      setSelectedProductIds([]);
      handleViewDetails(currentPromotion);
    } catch (error) {
      message.error(error.message || "Lỗi khi thêm sản phẩm!");
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      await removeProductFromSale(currentPromotionId, productId);
      message.success("Xóa sản phẩm thành công!");
      if (currentPromotion) {
        handleViewDetails(currentPromotion);
      } else {
        console.warn("currentPromotion is null, cannot call handleViewDetails");
        const saleDetails = await getSaleById(currentPromotionId);
        handleViewDetails(saleDetails);
      }
    } catch (error) {
      message.error(error.message || "Lỗi khi xóa sản phẩm!");
    }
  };

  // Thêm danh mục
  const handleAddCategory = async () => {
    if (!selectedCategoryIds.length) {
      message.error("Vui lòng chọn ít nhất một danh mục!");
      return;
    }

    try {
      for (const categoryId of selectedCategoryIds) {
        const parsedCategoryId = parseInt(categoryId, 10);
        if (isNaN(parsedCategoryId)) {
          throw new Error(`ID danh mục không hợp lệ: ${categoryId}`);
        }
        await addCategoryToSale(currentPromotion.id, {
          categoryId: parsedCategoryId,
        });
      }
      message.success("Thêm danh mục thành công!");
      setCategoryModalVisible(false);
      setSelectedCategoryIds([]);
      handleViewDetails(currentPromotion);
    } catch (error) {
      message.error(error.message || "Lỗi khi thêm danh mục!");
    }
  };

  const handleRemoveCategory = useCallback(
    async (categoryId) => {
      try {
        if (!currentPromotionId) {
          message.error("Không tìm thấy ID chương trình khuyến mãi!");
          return;
        }
        await removeCategoryFromSale(currentPromotionId, categoryId);
        message.success("Xóa danh mục thành công!");
        if (!currentPromotion) {
          console.warn("currentPromotion is null, fetching sale details...");
          const saleDetails = await getSaleById(currentPromotionId);
          setCurrentPromotion(saleDetails);
          handleViewDetails(saleDetails);
        } else {
          handleViewDetails(currentPromotion);
        }
      } catch (error) {
        message.error(error.message || "Lỗi khi xóa danh mục!");
      }
    },
    [currentPromotion, currentPromotionId, handleViewDetails],
  );

  // Tải sản phẩm cho modal
  const fetchProductsForModal = async () => {
    try {
      const productsResponse = await getProductList(1, 1000);
      const productsData = productsResponse?.data || [];

      const existingProductIds = (
        currentPromotion?.productStrategySales || []
      ).map((item) => item.product?.id);
      const filteredProducts = productsData.filter(
        (product) => !existingProductIds.includes(product.id),
      );

      setProductsForModal(filteredProducts);
    } catch (error) {
      message.error("Không thể tải danh sách sản phẩm!");
      setProductsForModal([]);
    }
  };

  const fetchCategoriesForModal = async () => {
    try {
      const categoriesResponse = await getAllCategories();
      const categoriesData = categoriesResponse || [];

      const existingCategoryIds = (
        currentPromotion?.categoryStrategySales || []
      ).map((item) => item.category?.id);

      const childCategories = [];
      categoriesData.forEach((category) => {
        if (category.children && category.children.length > 0) {
          category.children.forEach((child) => {
            if (!existingCategoryIds.includes(child.id)) {
              childCategories.push(child);
            }
          });
        }
      });

      setCategoriesForModal(childCategories);
    } catch (error) {
      message.error("Không thể tải danh sách danh mục!");
      setCategoriesForModal([]);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Tên chương trình",
        key: "name",
        render: (record) => record.name || "N/A",
        width: 200,
      },
      {
        title: "Giảm giá (%)",
        key: "discountAmount",
        render: (record) => record.discountAmount || 0,
        width: 120,
      },
      {
        title: "Ngày bắt đầu",
        key: "startDate",
        render: (record) =>
          record.startDate
            ? new Date(record.startDate).toLocaleDateString()
            : "N/A",
        width: 150,
      },
      {
        title: "Ngày kết thúc",
        key: "endDate",
        render: (record) =>
          record.endDate
            ? new Date(record.endDate).toLocaleDateString()
            : "N/A",
        width: 150,
      },
      {
        title: "Trạng thái",
        key: "isActive",
        render: (record) => (
          <Tag color={record.isActive ? "green" : "red"}>
            {record.isActive ? "Đang diễn ra" : "Đã kết thúc"}
          </Tag>
        ),
        width: 120,
      },
      {
        title: "Hành động",
        key: "actions",
        render: (record) => (
          <div style={{ display: "flex", gap: 8 }}>
            <Button type="primary" onClick={() => handleViewDetails(record)}>
              Chi tiết
            </Button>
            <Button type="primary" onClick={() => openModal(record)}>
              Sửa
            </Button>
          </div>
        ),
        width: 200,
      },
    ],
    [],
  );

  const productColumns = useMemo(() => {
    const columns = [
      {
        title: "Hình ảnh",
        key: "images",
        render: (record) => renderProductImage(record.product?.images),
        width: 100,
      },
      {
        title: "Tên sản phẩm",
        key: "name",
        render: (record) => record.product?.name || "N/A",
        width: 200,
      },
      {
        title: "Giá gốc",
        key: "originalPrice",
        render: (record) => record.product?.originalPrice || "N/A",
        width: 100,
        align: "right",
      },
      {
        title: "Giá sau khi giảm",
        key: "finalPrice",
        render: (record) => record.product?.finalPrice || "N/A",
        width: 150,
        align: "right",
      },
    ];

    if (!currentPromotion?.isGlobalSale) {
      columns.push({
        title: "Hành động",
        key: "actions",
        render: (record) => (
          <Button danger onClick={() => handleRemoveProduct(record.product.id)}>
            Xóa
          </Button>
        ),
        width: 130,
        align: "center",
      });
    }

    return columns;
  }, [handleRemoveProduct, currentPromotion?.isGlobalSale]);

  const productModalColumns = useMemo(
    () => [
      {
        title: "Hình ảnh",
        key: "images",
        render: (record) => renderProductImage(record.images),
        width: 100,
      },
      {
        title: "Tên sản phẩm",
        key: "name",
        render: (record) => record.name || "N/A",
        width: 200,
      },
      {
        title: "Giá gốc",
        key: "originalPrice",
        render: (record) => record.originalPrice || "N/A",
        width: 100,
        align: "right",
      },
      {
        title: "Giá sau khi giảm",
        key: "finalPrice",
        render: (record) => record.finalPrice || "N/A",
        width: 150,
        align: "right",
      },
    ],
    [],
  );

  const categoryColumns = useMemo(
    () => [
      {
        title: "Tên danh mục",
        key: "name",
        render: (record) => record.category?.name || "N/A",
        width: 200,
      },
      {
        title: "Hành động",
        key: "actions",
        render: (record) => (
          <Button
            danger
            onClick={() => handleRemoveCategory(record.category.id)}
          >
            Xóa
          </Button>
        ),
        width: 100,
      },
    ],
    [handleRemoveCategory],
  );

  // Columns cho modal thêm danh mục
  const categoryModalColumns = useMemo(
    () => [
      {
        title: "Tên danh mục",
        key: "name",
        render: (record) => record.name || "N/A",
        width: 200,
      },
    ],
    [],
  );

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.container}
        style={{
          background:
            "linear-gradient(90deg, #f3e0bf, rgba(253, 252, 243, 0.7))",
          height: "70px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h2>QUẢN LÝ CHƯƠNG TRÌNH KHUYẾN MÃI</h2>
      </div>
      <main className={styles.main}>
        <div className={styles.container}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Danh sách chương trình" key="1">
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTools}>
                    <div className={styles.filterRow}>
                      <Filter
                        filters={filters}
                        data={data}
                        validData={validData}
                        setValidData={setValidData}
                        standardSort={[
                          { name: "Tên chương trình", type: "name" },
                          { name: "Giảm giá (%)", type: "discountAmount" },
                        ]}
                        searchFields={[
                          {
                            key: "name",
                            placeholder: "Tìm kiếm theo tên chương trình",
                          },
                        ]}
                      />
                    </div>
                    <div className={styles.filterRow}>
                      <Select
                        style={{ width: 200 }}
                        placeholder="Lọc theo trạng thái"
                        allowClear
                        onChange={(value) => {
                          setIsActiveFilter(value);
                          setCurrentPage(1);
                        }}
                      >
                        <Option value={true}>Đang diễn ra</Option>
                        <Option value={false}>Đã kết thúc</Option>
                      </Select>
                      <RangePicker
                        onChange={(dates) => {
                          setDateRangeFilter(dates || []);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.cardBtns}>
                    <Button type="primary" onClick={() => openModal()}>
                      Thêm chương trình
                    </Button>
                    <Button
                      danger
                      onClick={handleDeletePromotion}
                      disabled={!checkedRow.length}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <AntTable
                    dataSource={validData}
                    columns={columns}
                    rowKey={(record) => record.id}
                    pagination={false}
                    rowSelection={{
                      selectedRowKeys: checkedRow,
                      onChange: (selectedRowKeys) =>
                        setCheckedRow(selectedRowKeys),
                    }}
                    loading={loading}
                    className={styles.table}
                    scroll={{ x: "max-content" }}
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
            </TabPane>
            {/* <TabPane tab="Thống kê" key="2">
              <div className={styles.statisticsSection}>
                <div className={styles.gridContainer}>
                  <Card title="Chương trình khuyến mãi đang diễn ra">
                    {activeSale ? (
                      <div>
                        <p>
                          <strong>Tên chương trình:</strong> {activeSale.name}
                        </p>
                        <p>
                          <strong>Giảm giá:</strong> {activeSale.discountAmount}
                          %
                        </p>
                        <p>
                          <strong>Ngày bắt đầu:</strong>{" "}
                          {new Date(activeSale.startDate).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Ngày kết thúc:</strong>{" "}
                          {new Date(activeSale.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <p>Không có chương trình nào đang diễn ra.</p>
                    )}
                  </Card>
                </div>
                <div className={styles.tableContainer}>
                  <Card title="Danh sách sản phẩm trong chương trình khuyến mãi">
                    <List
                      dataSource={saleProducts}
                      renderItem={(item) => (
                        <List.Item>
                          {renderProductImage(item.images)}
                          <span style={{ marginLeft: 16 }}>{item.name}</span>
                        </List.Item>
                      )}
                    />
                  </Card>
                </div>
                <div className={styles.tableContainer}>
                  <Card title="Danh sách danh mục trong chương trình khuyến mãi">
                    <List
                      dataSource={saleCategories}
                      renderItem={(item) => (
                        <List.Item>
                          <span>{item.name}</span>
                        </List.Item>
                      )}
                    />
                  </Card>
                </div>
              </div>
            </TabPane> */}
          </Tabs>
        </div>
      </main>

      <Modal
        title={
          editMode
            ? "Sửa chương trình khuyến mãi"
            : "Thêm chương trình khuyến mãi"
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setIsGlobalSale(false);
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddOrEditPromotion}
          initialValues={{ isGlobalSale: false }}
        >
          <Form.Item
            name="name"
            label="Tên chương trình"
            rules={[
              { required: true, message: "Vui lòng nhập tên chương trình!" },
            ]}
          >
            <Input placeholder="Nhập tên chương trình" />
          </Form.Item>
          <Form.Item
            name="discountAmount"
            label="Số tiền giảm giá"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền giảm giá!" },
              {
                type: "number",
                min: 0,
                message: "Số tiền giảm giá phải lớn hơn hoặc bằng 0!",
              },
            ]}
          >
            <InputNumber
              min={0}
              step={1000}
              style={{ width: "100%" }}
              placeholder="Nhập số tiền giảm giá"
            />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="Thời gian diễn ra"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian diễn ra!" },
            ]}
          >
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              // Nếu bạn muốn giới hạn khoảng thời gian:
              // disabledDate={(current) => current && current < dayjs().startOf('day')}
              // Nếu muốn khởi tạo mặc định:
              // defaultValue={[dayjs(), dayjs().add(1, 'day')]}
            />
          </Form.Item>
          {editMode && (
            <Form.Item
              name="isActive"
              label="Trạng thái"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Đang diễn ra"
                unCheckedChildren="Đã kết thúc"
              />
            </Form.Item>
          )}
          {!editMode && (
            <>
              <Form.Item
                name="isGlobalSale"
                label="Áp dụng cho toàn bộ sản phẩm"
                valuePropName="checked"
              >
                <Switch
                  onChange={(checked) => {
                    setIsGlobalSale(checked);
                    if (checked) {
                      form.setFieldsValue({ categoryId: null, products: [] });
                    }
                  }}
                />
              </Form.Item>
              {!isGlobalSale && (
                <>
                  <Form.Item
                    label="Danh mục áp dụng"
                    name="categoryId"
                  >
                    <Select placeholder="Chọn danh mục">
                      {categoryList.map((cat) =>
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
                    </Select>
                  </Form.Item>
                  <Form.Item name="products" label="Sản phẩm áp dụng">
                    <Select
                      mode="multiple"
                      placeholder="Chọn sản phẩm"
                      allowClear
                      style={{ width: "100%" }}
                    >
                      {productList.map((product) => (
                        <Option key={product.id} value={product.id}>
                          {product.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </>
              )}
            </>
          )}
        </Form>
      </Modal>

      <Modal
        title="Chi tiết chương trình khuyến mãi"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setCurrentPromotion(null);
          setAllProducts([]);
        }}
        footer={null}
        width={800}
        centered
        style={{ maxHeight: "80vh" }}
      >
        <div style={{ maxHeight: "80vh", overflowY: "auto" }}>
          {currentPromotion ? (
            <div className={styles.detailContent}>
              <div className={styles.detailInfo}>
                <div className={styles.detailLeft}>
                  <h3>Tên chương trình: {currentPromotion.name}</h3>
                  <p>
                    <strong>Số tiền giảm giá:</strong>{" "}
                    {currentPromotion.discountAmount}%
                  </p>
                  <p>
                    <strong>Ngày bắt đầu:</strong>{" "}
                    {new Date(currentPromotion.startDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Ngày kết thúc:</strong>{" "}
                    {new Date(currentPromotion.endDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    {currentPromotion.isActive ? "Đang diễn ra" : "Đã kết thúc"}
                  </p>
                  <p>
                    <strong>Áp dụng toàn bộ sản phẩm:</strong>{" "}
                    {currentPromotion.isGlobalSale ? "Có" : "Không"}
                  </p>
                </div>

                <div className={styles.detailRight}>
                  <h4
                    style={{ cursor: "pointer" }}
                    onClick={handleFetchSeoData}
                    className={styles.seoButton}
                  >
                    SEO cho khách hàng
                  </h4>
                  {seoData ? (
                    <div>
                      <p>
                        <strong>Trạng thái gửi mail:</strong> Đã gửi mail
                      </p>
                    </div>
                  ) : (
                    <p>Nhấn để xem thông tin SEO.</p>
                  )}
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Sản phẩm trong chương trình</h3>
                {!currentPromotion.isGlobalSale && (
                  <Button
                    type="primary"
                    onClick={() => {
                      setProductModalVisible(true);
                      fetchProductsForModal();
                    }}
                  >
                    Thêm sản phẩm
                  </Button>
                )}
                <AntTable
                  dataSource={
                    currentPromotion.isGlobalSale
                      ? allProducts
                      : currentPromotion.productStrategySales || []
                  }
                  columns={productColumns}
                  rowKey={(record) => record.id}
                  pagination={false}
                  className={styles.table}
                  scroll={{ x: "max-content" }}
                />
              </div>

              {!currentPromotion.isGlobalSale && (
                <div className={styles.detailSection}>
                  <h3>Danh mục trong chương trình</h3>
                  <Button
                    type="primary"
                    onClick={() => {
                      setCategoryModalVisible(true);
                      fetchCategoriesForModal();
                    }}
                  >
                    Thêm danh mục
                  </Button>
                  <AntTable
                    dataSource={currentPromotion.categoryStrategySales || []}
                    columns={categoryColumns}
                    rowKey={(record) => record.id}
                    pagination={false}
                    className={styles.table}
                    scroll={{ x: "max-content" }}
                  />
                </div>
              )}
            </div>
          ) : (
            <p>Không có dữ liệu</p>
          )}
        </div>
      </Modal>

      <Modal
        title="Thêm sản phẩm vào chương trình"
        open={productModalVisible}
        onCancel={() => {
          setProductModalVisible(false);
          setProductsForModal([]);
          setSelectedProductIds([]);
        }}
        onOk={handleAddProduct}
        width={800}
      >
        <AntTable
          dataSource={productsForModal}
          columns={productModalColumns}
          rowKey={(record) => record.id}
          pagination={false}
          rowSelection={{
            selectedRowKeys: selectedProductIds,
            onChange: (selectedRowKeys) =>
              setSelectedProductIds(selectedRowKeys),
          }}
          className={styles.table}
          scroll={{ x: "max-content" }}
        />
      </Modal>

      <Modal
        title="Thêm danh mục vào chương trình"
        open={categoryModalVisible}
        onCancel={() => {
          setCategoryModalVisible(false);
          setCategoriesForModal([]);
          setSelectedCategoryIds([]);
        }}
        centered
        onOk={handleAddCategory}
        width={800}
        style={{ maxHeight: "80vh" }}
      >
        <div style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <AntTable
            dataSource={categoriesForModal}
            columns={categoryModalColumns}
            rowKey={(record) => record.id}
            pagination={false}
            rowSelection={{
              selectedRowKeys: selectedCategoryIds,
              onChange: (selectedRowKeys) =>
                setSelectedCategoryIds(selectedRowKeys),
            }}
            className={styles.table}
            scroll={{ x: "max-content" }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default PromotionList;
