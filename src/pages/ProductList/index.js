import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getProductList } from "../../services/api/productService";
import { getAllSales } from "../../services/api/promotionService";
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
  Empty,
} from "antd";
import { FilterOutlined } from "@ant-design/icons";
import styles from "./index.module.scss";
import "./ProductList.css";

const removeVietnameseTones = (str) => {
  str = str.toLowerCase();
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  str = str.replace(/đ/g, "d").replace(/Đ/g, "D");
  return str;
};

const { Panel } = Collapse;

const ProductList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [sales, setSales] = useState([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const limit = 15;

  const [selectedFilters, setSelectedFilters] = useState({
    priceRanges: [],
    materials: [],
    sizes: [],
    categories: [],
    sales: [],
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
    15: { material: "Ngọc Trai", size: "Nhỏ" },
    16: { material: "Đá CZ", size: "Lớn" },
    17: { material: "Bạc Y 925", size: "Trung" },
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryIds =
      searchParams
        .get("categories")
        ?.split(",")
        .map(Number)
        .filter((id) => id) || [];
    const saleIds =
      searchParams
        .get("sales")
        ?.split(",")
        .map(Number)
        .filter((id) => id) || [];
    const urlKeyword = searchParams.get("keyword");

    setSelectedFilters((prev) => ({
      ...prev,
      categories: categoryIds,
      sales: saleIds,
    }));

    setKeyword(urlKeyword ? decodeURIComponent(urlKeyword) : "");
  }, [location]);

  const fetchSalesData = useCallback(async () => {
    try {
      const salesResponse = await getAllSales({ page: 1, limit: 1000 });
      const activeSales = salesResponse.filter((sale) => sale.isActive);
      setSales(activeSales);
    } catch (error) {
      console.error("Lỗi khi tải chương trình giảm giá:", error);
    }
  }, []);

  const fetchProductsData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getProductList(1, 1000); // Lấy tất cả sản phẩm
      const productsData = response.data || [];
      const uniqueCategories = [
        ...new Map(
          productsData.map((product) => [
            product.category?.id,
            { id: product.category?.id, name: product.category?.name },
          ]),
        ).values(),
      ].filter((cat) => cat.id && cat.name);

      setProducts(productsData);
      setFilteredProducts(productsData);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductsData();
    fetchSalesData();
  }, [fetchProductsData, fetchSalesData]);

  const applyFilters = useCallback(() => {
    let filtered = [...products];

    if (keyword.trim()) {
      const searchTerms = removeVietnameseTones(keyword)
        .split(/\s+/)
        .filter((term) => term);
      filtered = filtered.filter((product) => {
        const productName = removeVietnameseTones(product.name || "");
        return searchTerms.every((term) => productName.includes(term));
      });
    }

    if (selectedFilters.categories.length > 0) {
      filtered = filtered.filter(
        (product) =>
          product.category &&
          selectedFilters.categories.includes(product.category.id),
      );
    }

    if (selectedFilters.sales.length > 0) {
      const selectedSales = sales.filter((sale) =>
        selectedFilters.sales.includes(sale.id),
      );
      if (selectedSales.length > 0) {
        const saleProductIds = new Set();
        selectedSales.forEach((sale) => {
          if (sale.isGlobalSale) {
            products.forEach((product) => saleProductIds.add(product.id));
          } else {
            sale.productStrategySales?.forEach((item) =>
              saleProductIds.add(item.product?.id),
            );
          }
        });
        filtered = filtered.filter((product) => saleProductIds.has(product.id));
      }
    }

    if (selectedFilters.priceRanges.length > 0) {
      filtered = filtered.filter((product) => {
        const price = parseFloat(product.finalPrice || 0);
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

    if (sortOption === "price-asc") {
      filtered.sort(
        (a, b) => parseFloat(a.finalPrice) - parseFloat(b.finalPrice),
      );
    } else if (sortOption === "price-desc") {
      filtered.sort(
        (a, b) => parseFloat(b.finalPrice) - parseFloat(a.finalPrice),
      );
    }

    setFilteredProducts(filtered);
    setTotalItems(filtered.length);
    const calculatedTotalPages = Math.max(
      1,
      Math.ceil(filtered.length / limit),
    );
    setTotalPages(calculatedTotalPages);

    if (currentPage > calculatedTotalPages) {
      setCurrentPage(1);
      return;
    }

    const startIndex = (currentPage - 1) * limit;
    const paginatedProducts = filtered.slice(startIndex, startIndex + limit);
    setDisplayedProducts(paginatedProducts);
  }, [
    products,
    selectedFilters,
    keyword,
    sortOption,
    currentPage,
    limit,
    sales,
  ]);

  useEffect(() => {
    setCurrentPage(1); // Reset về trang 1 khi bộ lọc hoặc từ khóa thay đổi
  }, [selectedFilters, keyword]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Cuộn lên đầu trang khi đổi trang
  };

  const handleFilterChange = (type, value) => {
    setSelectedFilters((prev) => {
      const currentValues = prev[type];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      const updatedFilters = { ...prev, [type]: newValues };

      const queryParams = [];
      if (updatedFilters.categories.length > 0) {
        queryParams.push(`categories=${updatedFilters.categories.join(",")}`);
      }
      if (updatedFilters.sales.length > 0) {
        queryParams.push(`sales=${updatedFilters.sales.join(",")}`);
      }
      const queryString =
        queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
      navigate(`/list-product${queryString}`, { replace: true });

      return updatedFilters;
    });
  };

  const handleFilter = () => {
    setIsMobileFilterOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedFilters({
      priceRanges: [],
      materials: [],
      sizes: [],
      categories: [],
      sales: [],
    });
    setKeyword("");
    setCurrentPage(1);
    navigate("/list-product", { replace: true });
  };

  const handleSortChange = (value) => {
    setSortOption(value);
    setCurrentPage(1);
  };

  const parsePrice = (price) => {
    return parseFloat(price || 0).toLocaleString("vi-VN");
  };

  if (error) return <div className={styles.errorMessage}>{error}</div>;

  const renderSidebar = () => (
    <div className={styles.filterContent}>
      <Collapse
        defaultActiveKey={[
          "categories",
          "sales",
          "price",
          "materials",
          "sizes",
        ]}
        bordered={false}
        expandIconPosition="right"
      >
        <Panel header="Danh mục sản phẩm" key="categories">
          {categories.map((category) => (
            <div key={category.id} className={styles.checkboxItem}>
              <Checkbox
                checked={selectedFilters.categories.includes(category.id)}
                onChange={() => handleFilterChange("categories", category.id)}
              >
                {category.name}
              </Checkbox>
            </div>
          ))}
        </Panel>

        <Panel header="Chương trình giảm giá" key="sales">
          {sales.length > 0 ? (
            sales.map((sale) => (
              <div key={sale.id} className={styles.checkboxItem}>
                <Checkbox
                  checked={selectedFilters.sales.includes(sale.id)}
                  onChange={() => handleFilterChange("sales", sale.id)}
                >
                  {sale.name}
                </Checkbox>
              </div>
            ))
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span>Chưa có chương trình giảm giá nào.</span>}
            />
          )}
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

  const handleProductClick = (productId) => {
    navigate(`/detail-product/${productId}`);
  };

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
            <Select
              value={sortOption}
              onChange={handleSortChange}
              style={{ width: 200 }}
            >
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
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không tìm thấy sản phẩm nào phù hợp với bộ lọc."
            />
          ) : (
            <div className={styles.productGrid}>
              {displayedProducts.map((product) => (
                <Card
                  key={product.id}
                  className={styles.productCard}
                  hoverable
                  cover={
                    <div className={styles.imageWrapper}>
                      <img
                        src={product.images?.[0] || "/images/fallback.jpg"}
                        alt={product.name}
                        className={styles.productImage}
                        onClick={() => handleProductClick(product.id)}
                        onError={(e) => {
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
                      {parseFloat(product.finalPrice) <
                      parseFloat(product.originalPrice) ? (
                        <>
                          <span className={styles.productPrice}>
                            {parsePrice(product.finalPrice)}đ
                          </span>
                          <span className={styles.salePrice}>
                            {parsePrice(product.originalPrice)}đ
                          </span>
                        </>
                      ) : (
                        <span className={styles.productPrice}>
                          {parsePrice(product.originalPrice)}đ
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {totalItems > 0 && (
            <div className={styles.pagination}>
              <Pagination
                current={currentPage}
                pageSize={limit}
                total={totalItems}
                onChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
