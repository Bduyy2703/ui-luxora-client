import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

  // Giả định chất liệu và kích thước cho sản phẩm (vì API không trả về)
  const productDetailsMock = {
    17: { material: "Bạc Y 925", size: "Trung" }, // Sản phẩm 3
    15: { material: "Ngọc Trai", size: "Nhỏ" }, // Sản phẩm 1
    16: { material: "Đá CZ", size: "Lớn" }, // Sản phẩm 2
  };

  // URL hình ảnh tạm thời (từ Imgur)
  const tempImageUrls = {
    17: "https://i.imgur.com/5tXhY4f.jpg", // Sản phẩm 3
    15: "https://i.imgur.com/8kJ2q0T.jpg", // Sản phẩm 1
    16: "https://i.imgur.com/3mL5v2N.jpg", // Sản phẩm 2
  };

  // Fetch danh sách sản phẩm
  const fetchProductsData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getProductList(currentPage, limit);
      const productsData = response.data || [];
      const total = response.total || 0;
      const totalPagesData = response.totalPages || 1;

      // Trích xuất danh mục từ sản phẩm
      const uniqueCategories = [
        ...new Map(
          productsData.map((product) => [
            product.category.id,
            {
              id: product.category.id,
              name: product.category.name,
            },
          ]),
        ).values(),
      ];

      // Thay thế URL hình ảnh tạm thời
      const updatedProducts = productsData.map((product) => ({
        ...product,
        images: [tempImageUrls[product.id] || product.images[0]], // Sử dụng URL tạm thời
      }));

      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts); // Ban đầu hiển thị tất cả
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
        (product) => product.category.id === selectedFilters.categoryId,
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

    // Lọc theo chất liệu
    if (selectedFilters.materials.length > 0) {
      filtered = filtered.filter((product) => {
        const material = productDetailsMock[product.id]?.material;
        return material && selectedFilters.materials.includes(material);
      });
    }

    // Lọc theo kích thước
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

  // Xử lý phân trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Xử lý click vào sản phẩm
  const handleProductClick = (productId) => {
    navigate(`/detail-product/${productId}`);
  };

  // Xử lý thay đổi bộ lọc
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
  };

  // Xử lý click vào danh mục
  const handleCategoryClick = (categoryId) => {
    setSelectedFilters((prev) => ({ ...prev, categoryId }));
  };

  // Xử lý nút lọc
  const handleFilter = () => {
    if (isMobileFilterOpen) {
      setIsMobileFilterOpen(false);
    }
  };

  // Xóa bộ lọc
  const handleClearFilters = () => {
    setSelectedFilters({
      priceRanges: [],
      materials: [],
      sizes: [],
      categoryId: null,
    });
  };

  // Parse giá từ chuỗi thành số
  const parsePrice = (price) => {
    return parseFloat(price).toLocaleString("vi-VN");
  };

  if (error) return <div className={styles.errorMessage}>{error}</div>;

  // Render sidebar (dùng chung cho desktop và mobile)
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

        <Panel header="Chất liệu chính" key="materials">
          {materials.map((material, index) => (
            <div key={index} className={styles.checkboxItem}>
              <Checkbox
                checked={selectedFilters.materials.includes(material)}
                onChange={() => handleFilterChange("materials", material)}
              >
                {material}
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
        {/* Sidebar cho desktop */}
        <aside className={styles.sidebar}>{renderSidebar()}</aside>

        {/* Nút mở bộ lọc trên mobile */}
        <div className={styles.mobileFilterButton}>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setIsMobileFilterOpen(true)}
          >
            Bộ lọc
          </Button>
        </div>

        {/* Drawer bộ lọc cho mobile */}
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
              {products.map((product) => (
                <Card
                  key={product.id}
                  className={styles.productCard}
                  hoverable
                  cover={
                    <div className={styles.imageWrapper}>
                      <Image
                        src={product.images?.[0] || "/images/fallback.jpg"}
                        alt={product.name}
                        fallback="/images/fallback.jpg"
                        className={styles.productImage}
                        preview={false}
                        onClick={() => handleProductClick(product.id)}
                        onError={() =>
                          console.log(
                            `Không thể tải hình ảnh cho sản phẩm ${product.name}`,
                          )
                        }
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
              ))}
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
