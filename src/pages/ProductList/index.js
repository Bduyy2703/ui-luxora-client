import React, { useState, useEffect } from "react";
import styles from "./ProductList.module.scss"; // Import CSS Module
import {
  fetchProducts,
  filterProducts,
  getProductbyCategory,
  getSaleProducts,
  searchProducts,
} from "../../services/api/productService"; // Import hàm gọi API
import Pagination from "./PaginationProp"; // Import component Pagination
import FilterSidebar from "./FilterSidebar";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

function ProductList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState({
    isSale: location.state?.isSale || false,
    isCategory: location.state?.isCategory || false,
    isFiltered: location.state?.isFiltered || false,
    categoryId: location.state?.categoryId || null,
    filters: location.state?.filters || null,
    keyword: searchParams.get("keyword") || "",
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 16;

  // Theo dõi thay đổi từ URL search params
  useEffect(() => {
    const keyword = searchParams.get("keyword");
    if (keyword !== state.keyword) {
      setState((prev) => ({ ...prev, keyword: keyword || "" }));
    }
  }, [searchParams]);

  // Đầu component, thêm useEffect để theo dõi location.state
  useEffect(() => {
    if (location.state) {
      setState(location.state);
      setCurrentPage(1); // Reset về trang 1 khi đổi category
    }
  }, [location.state]);

  // Xử lý fetch data
  useEffect(() => {
    const fetchProductsData = async () => {
      setLoading(true);
      try {
        let data;
        if (state.isFiltered && state.filters) {
          data = await filterProducts(state.filters);
        } else if (state.isSale) {
          data = await getSaleProducts(limit, currentPage);
        } else if (state.keyword) {
          data = await searchProducts(state.keyword, limit, currentPage);
        } else if (state.isCategory && state.categoryId) {
          data = await getProductbyCategory(
            state.categoryId,
            limit,
            currentPage,
          );
        } else {
          data = await fetchProducts(limit, currentPage);
        }
        // Kiểm tra và xử lý dữ liệu trả về một cách nhất quán
        const products =
          data.data?.product?.products || data.data?.products || [];
        const totalPages =
          data.data?.product?.totalPages || data.data?.totalPages || 1;
        setProducts(products);
        setTotalPages(totalPages);
        
      } catch (error) {
        console.error("Lỗi fetch data:", error);
        setError("Có lỗi xảy ra khi tải sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductsData();
  }, [
    currentPage,
    state.isSale,
    state.keyword,
    state.isCategory,
    state.categoryId,
    state.isFiltered,
    state.filters,
  ]);

  const handlePageChange = (page) => {
    setCurrentPage(page); // Cập nhật trang hiện tại khi người dùng thay đổi trang
  };

  const handleProductClick = (productId) => {
    navigate(`/detail-product/${productId}`);
  };

  if (loading) return <p>Đang tải sản phẩm...</p>; // Hiển thị thông báo khi đang tải
  if (error) return <p>{error}</p>; // Hiển thị thông báo lỗi nếu có

  return (
    <div className={styles.mainContent}>
      <div className={styles.row}>
        <FilterSidebar />
        <div className={styles.productSection}>
          <div className={styles.productHeader}>
            <h2>Sản phẩm quà tặng</h2>
            <select className={styles.sortSelect}>
              <option>Sắp xếp: Mặc định</option>
            </select>
          </div>
          <div className={styles.productGrid}>
            {products.length === 0 ? (
              <p>Không có sản phẩm nào.</p>
            ) : (
              products.map((product) => (
                <div key={product._id} className={styles.productCard} onClick={() => handleProductClick(product._id)}>
                  <div className={styles.productImage}>
                    <img
                      style={{cursor: 'pointer'}}
                      src={
                        product.product_details.product_images[0]?.secure_url ||
                        "https://via.placeholder.com/300"
                      }
                      alt={product.product_name}
                    />
                  </div>
                  <div className={styles.productInfo}>
                    <h2 style={{cursor: 'pointer'}} className={styles.productName}>
                      {product.product_name}
                    </h2>
                    <div className={styles.priceContainer}>
                      <p className={styles.productPrice}>
                        {product.product_price?.toLocaleString("vi-VN")}đ
                      </p>
                      {product.product_sale_price && (
                        <p className={styles.salePrice}>
                          {product.product_sale_price.toLocaleString("vi-VN")}đ
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductList;