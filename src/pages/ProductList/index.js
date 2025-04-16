import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getProductList } from "../../services/api/productService";
import {
  Image,
  Pagination,
  Spin,
  Button,
  Checkbox,
  Select,
  Card,
  Collapse,
  Skeleton,
  Drawer,
  Space,
} from "antd";
import { FilterOutlined } from "@ant-design/icons";
import styles from "./index.module.scss";
import "./ProductList.css";

const { Panel } = Collapse;

const ProductList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const limit = 16;

  // Filter state
  const [selectedFilters, setSelectedFilters] = useState({
    priceRanges: [],
    materials: [],
    sizes: [],
    categoryId: null,
  });

  const priceRanges = [
    { label: "Dưới 500k", min: 0, max: 500000 },
    { label: "500k - 2 triệu", min: 500000, max: 2000000 },
    { label: "2 triệu - 3 triệu", min: 2000000, max: 3000000 },
    { label: "5 triệu - 10 triệu", min: 5000000, max: 10000000 },
  ];
  const materials = ["Bạc Y 925", "Ngọc Trai", "Đá CZ"];
  const sizes = ["Nhỏ", "Trung", "Lớn"];

  const productDetailsMock = {
    17: { material: "Bạc Y 925", size: "Trung" },
    15: { material: "Ngọc Trai", size: "Nhỏ" },
    16: { material: "Đá CZ", size: "Lớn" },
  };

  // Đọc categoryId từ query parameter khi component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryId = searchParams.get("categoryId");
    if (categoryId) {
      setSelectedFilters((prev) => ({
        ...prev,
        categoryId: parseInt(categoryId), // Chuyển thành số
      }));
    }

    // Xử lý state từ location (nếu có, từ các nguồn khác như navigation)
    const { state } = location;
    if (state?.isCategory && state?.categoryId) {
      setSelectedFilters((prev) => ({
        ...prev,
        categoryId: state.categoryId,
      }));
    } else if (state?.isSale) {
      setSelectedFilters((prev) => ({
        ...prev,
        categoryId: null,
      }));
    }
  }, [location]);

  const fetchProductsData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getProductList(currentPage, limit);
      console.log("response", response);
      const productsData = response.data || [];
      const total = response.total || 0;
      const totalPagesData = response.totalPages || 1;

      const uniqueCategories = [
        ...new Map(
          productsData.map((product) => [
            product.category.id,
            { id: product.category.id, name: product.category.name },
          ]),
        ).values(),
      ];

      setProducts(productsData);
      setFilteredProducts(productsData);
      setTotalItems(total);
      setTotalPages(totalPagesData);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    fetchProductsData();
  }, [fetchProductsData]);

  // Xử lý lọc sản phẩm
  const applyFilters = useCallback(() => {
    let filtered = [...products];

    // Lọc theo danh mục
    if (selectedFilters.categoryId) {
      filtered = filtered.filter(
        (product) =>
          product.category &&
          product.category.id === selectedFilters.categoryId,
      );
    }

    // Lọc theo khoảng giá
    if (selectedFilters.priceRanges.length > 0) {
      filtered = filtered.filter((product) => {
        const price = parseFloat(product.finalPrice);
        return selectedFilters.priceRanges.some((rangeLabel) => {
          const range = priceRanges.find((r) => r.label === rangeLabel);
          return price >= range.min && price <= range.max;
        });
      });
    }

    if (selectedFilters.materials.length > 0) {
      filtered = filtered.filter((product) => {
        const material = productDetailsMock[product.id]?.material;
        return material && selectedFilters.materials.includes(material);
      });
    }

    if (selectedFilters.sizes.length > 0) {
      filtered = filtered.filter((product) => {
        const size = productDetailsMock[product.id]?.size;
        return size && selectedFilters.sizes.includes(size);
      });
    }

    setFilteredProducts(filtered);
    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / limit));
  }, [products, selectedFilters, limit]);

  useEffect(() => {
    applyFilters();
  }, [selectedFilters, applyFilters]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleProductClick = (productId) => {
    navigate(`/detail-product/${productId}`);
  };

  const handleFilterChange = (type, value) => {
    setSelectedFilters((prev) => {
      if (type === "categoryId") {
        return {
          ...prev,
          categoryId: prev.categoryId === value ? null : value,
        };
      }
      const currentValues = prev[type];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      return { ...prev, [type]: newValues };
    });
    // Cập nhật URL khi thay đổi bộ lọc danh mục
    if (type === "categoryId") {
      const newCategoryId = selectedFilters.categoryId === value ? null : value;
      navigate(
        `/list-product${newCategoryId ? `?categoryId=${newCategoryId}` : ""}`,
        {
          replace: true,
        },
      );
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedFilters((prev) => ({ ...prev, categoryId }));
    // Cập nhật URL khi chọn danh mục
    navigate(`/list-product${categoryId ? `?categoryId=${categoryId}` : ""}`, {
      replace: true,
    });
  };

  const handleFilter = () => {
    if (isMobileFilterOpen) {
      setIsMobileFilterOpen(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedFilters({
      priceRanges: [],
      materials: [],
      sizes: [],
      categoryId: null,
    });
    // Xóa query parameter khi xóa bộ lọc
    navigate("/list-product", { replace: true });
  };

  const parsePrice = (price) => {
    return parseFloat(price).toLocaleString("vi-VN");
  };

  if (error) return <div className={styles.errorMessage}>{error}</div>;

  const renderSidebar = () => (
    <div className={styles.filterContent}>
      <Collapse
        defaultActiveKey={["categories", "price", "materials", "sizes"]}
        bordered={false}
        expandIconPosition="right"
      >
        <Panel header="Danh mục sản phẩm" key="categories">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`${styles.categoryItem} ${
                selectedFilters.categoryId === category.id
                  ? styles.selected
                  : ""
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </div>
          ))}
        </Panel>

        <Panel header="Chọn khoảng giá" key="price">
          {priceRanges.map((range, index) => (
            <div key={index} className={styles.checkboxItem}>
              <Checkbox
                checked={selectedFilters.priceRanges.includes(range.label)}
                onChange={() => handleFilterChange("priceRanges", range.label)}
              >
                {range.label}
              </Checkbox>
            </div>
          ))}
        </Panel>

        <Panel header="Kích thước" key="sizes">
          {sizes.map((size, index) => (
            <div key={index} className={styles.checkboxItem}>
              <Checkbox
                checked={selectedFilters.sizes.includes(size)}
                onChange={() => handleFilterChange("sizes", size)}
              >
                {size}
              </Checkbox>
            </div>
          ))}
        </Panel>
      </Collapse>

      <div className={styles.filterButtonContainer}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button type="primary" onClick={handleFilter} block>
            Lọc sản phẩm
          </Button>
          <Button onClick={handleClearFilters} block>
            Xóa bộ lọc
          </Button>
        </Space>
      </div>
    </div>
  );

  return (
    <div className={styles.productListContainer}>
      <div className={styles.mainContent}>
        <aside className={styles.sidebar}>{renderSidebar()}</aside>

        <div className={styles.mobileFilterButton}>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setIsMobileFilterOpen(true)}
          >
            Bộ lọc
          </Button>
        </div>

        <Drawer
          title="Bộ lọc sản phẩm"
          placement="left"
          onClose={() => setIsMobileFilterOpen(false)}
          open={isMobileFilterOpen}
          className={styles.mobileFilterDrawer}
        >
          {renderSidebar()}
        </Drawer>

        <div className={styles.productSection}>
          <div className={styles.productHeader}>
            <h2>Sản phẩm quà tặng</h2>
            <Select defaultValue="default" style={{ width: 200 }}>
              <Select.Option value="default">Sắp xếp: Mặc định</Select.Option>
              <Select.Option value="price-asc">Giá: Thấp đến Cao</Select.Option>
              <Select.Option value="price-desc">
                Giá: Cao đến Thấp
              </Select.Option>
            </Select>
          </div>

          {loading ? (
            <div className={styles.productGrid}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  active
                  avatar={{ shape: "square", size: 200 }}
                  paragraph={{ rows: 2 }}
                  className={styles.skeletonCard}
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <p>Không có sản phẩm nào.</p>
          ) : (
            <div className={styles.productGrid}>
              {filteredProducts.map((product) => {
                console.log("productt:", product?.images);

                return (
                  <Card
                    key={product.id}
                    className={styles.productCard}
                    hoverable
                    cover={
                      <div className={styles.imageWrapper}>
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className={styles.productImage}
                          onClick={() => handleProductClick(product.id)}
                          onError={(e) => {
                            console.log(
                              `Không thể tải hình ảnh cho sản phẩm ${product.name}`,
                            );
                            e.target.src = "/images/fallback.jpg";
                          }}
                        />
                      </div>
                    }
                  >
                    <div className={styles.productInfo}>
                      <h3
                        className={styles.productName}
                        onClick={() => handleProductClick(product.id)}
                      >
                        {product.name}
                      </h3>
                      <div className={styles.priceContainer}>
                        <span className={styles.productPrice}>
                          {parsePrice(product.finalPrice)}đ
                        </span>
                        {product.finalPrice !== product.originalPrice && (
                          <span className={styles.salePrice}>
                            {parsePrice(product.originalPrice)}đ
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          <div className={styles.pagination}>
            <Pagination
              current={currentPage}
              pageSize={limit}
              total={totalItems}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
