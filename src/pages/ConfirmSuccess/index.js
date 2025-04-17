import { getProductList } from "../../services/api/productService";
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./index.module.scss";

const ThankYou = () => {
  const [result, setResult] = useState("");
  const [products, setProducts] = useState([]);
  const [accessToken, setAccessToken] = useState(null); // Lưu accessToken trong state
  const navigate = useNavigate();
  const location = useLocation();
  const hasCalledApi = useRef(false);

  // Tạo axios instance tạm thời với accessToken trong header
  const createAuthAxios = (token) => {
    return axios.create({
      baseURL: "http://35.247.185.8/api/v1",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
  };

  useEffect(() => {
    // Kiểm tra xem tài khoản đã được xác minh chưa
    const isVerified = sessionStorage.getItem("isEmailVerified");

    if (isVerified) {
      setResult("Tài khoản của bạn đã được xác minh!");
      return;
    }

    // Lấy tokenOTP và accessToken từ query parameters
    const queryParams = new URLSearchParams(location.search);
    const tokenOTP = queryParams.get("tokenOTP");
    const token = queryParams.get("accessToken");

    // Hàm gọi API xác minh
    const confirmEmail = async () => {
      try {
        const response = await axios.get(
          `http://35.247.185.8/api/v1/auth/confirm-email?tokenOTP=${tokenOTP}&accessToken=${token}`,
        );
        setResult("Xác minh tài khoản thành công!");
        setAccessToken(token); // Lưu accessToken vào state
        sessionStorage.setItem("isEmailVerified", "true"); // Lưu trạng thái xác minh
      } catch (error) {
        console.error("Lỗi khi xác minh email:", error);
        setResult("Xác minh tài khoản thất bại. Vui lòng thử lại.");
      }
    };

    // Chỉ gọi API nếu có token và chưa gọi trước đó
    if (tokenOTP && token && !hasCalledApi.current) {
      hasCalledApi.current = true;
      confirmEmail();
    } else if (!tokenOTP || !token) {
      setResult("Không tìm thấy token xác minh.");
    }

    // Lấy danh sách sản phẩm gợi ý (giữ nguyên, không thêm accessToken)
    const fetchProducts = async () => {
      try {
        const response = await getProductList(1, 1000);
        setProducts(response.data.slice(0, 4));
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error);
        setProducts([]);
      }
    };
    fetchProducts();
  }, [location.search]);

  // Hàm gọi API ví dụ (trang cá nhân, giỏ hàng) với accessToken
  const fetchProtectedData = async (endpoint) => {
    if (!accessToken) {
      console.error("Không có accessToken để gọi API");
      return null;
    }
    try {
      const authAxios = createAuthAxios(accessToken);
      const response = await authAxios.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi gọi API ${endpoint}:`, error);
      if (error.response?.status === 401) {
        setResult("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        sessionStorage.removeItem("isEmailVerified");
        navigate("/login");
      }
      return null;
    }
  };

  const handleViewProducts = () => {
    navigate("/list-product");
  };

  const handleProductClick = (productId) => {
    navigate(`/detail-product/${productId}`);
  };

  // Ví dụ: Chuyển hướng đến trang cá nhân/giỏ hàng với accessToken
  const handleViewProfile = () => {
    // Truyền accessToken qua state của react-router-dom
    navigate("/profile", { state: { accessToken } });
  };

  const handleViewCart = () => {
    // Truyền accessToken qua state của react-router-dom
    navigate("/cart", { state: { accessToken } });
  };

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <img
          src="https://bizweb.dktcdn.net/100/461/213/themes/870653/assets/slider_3.jpg?1744711547396"
          alt="Cảm ơn"
          className={styles.headerImage}
        />
        <div className={styles.overlay}>
          <h1 className={styles.title}>
            {result || "Cảm ơn bạn đã xác minh tài khoản!"}
          </h1>
          <p className={styles.subtitle}>
            Chào mừng bạn đến với thế giới trang sức tinh tế. Khám phá những sản
            phẩm nổi bật dưới đây!
          </p>
          <button
            onClick={handleViewProducts}
            className={styles.viewMoreButton}
          >
            Xem thêm sản phẩm
          </button>
          {/* Nút ví dụ để xem trang cá nhân hoặc giỏ hàng */}
          <button
            onClick={handleViewProfile}
            className={styles.viewMoreButton}
            style={{ marginLeft: "10px" }}
          >
            Xem trang cá nhân
          </button>
          <button
            onClick={handleViewCart}
            className={styles.viewMoreButton}
            style={{ marginLeft: "10px" }}
          >
            Xem giỏ hàng
          </button>
        </div>
      </div>

      {/* Product Suggestion Section */}
      <div className={styles.productSection}>
        <h2 className={styles.sectionTitle}>Gợi ý sản phẩm cho bạn</h2>
        <div className={styles.productGrid}>
          {products.map((product, index) => (
            <div
              key={product.id}
              className={styles.productCard}
              style={{ animationDelay: `${index * 0.2}s` }}
              onClick={() => handleProductClick(product.id)}
            >
              <div className={styles.productImageWrapper}>
                <img
                  src={product.images?.[0] || "https://via.placeholder.com/200"}
                  alt={product.name}
                  className={styles.productImage}
                />
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <div className={styles.priceWrapper}>
                  <span className={styles.finalPrice}>
                    {new Intl.NumberFormat("vi-VN").format(product.finalPrice)}{" "}
                    đ
                  </span>
                  <span className={styles.originalPrice}>
                    {new Intl.NumberFormat("vi-VN").format(
                      product.originalPrice,
                    )}{" "}
                    đ
                  </span>
                </div>
                <button className={styles.soldButton}>Đang bán</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThankYou;