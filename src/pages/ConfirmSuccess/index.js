import { getProductList } from "../../services/api/productService";
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./index.module.scss";

const ThankYou = () => {
  const [result, setResult] = useState("");
  const [products, setProducts] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const hasCalledApi = useRef(false);

  const createAuthAxios = (token) => {
    return axios.create({
      baseURL: "https://www.dclux.store/api/v1",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
  };

  useEffect(() => {
    const isVerified = sessionStorage.getItem("isEmailVerified");

    if (isVerified) {
      setResult("Tài khoản của bạn đã được xác minh!");
      return;
    }

    const queryParams = new URLSearchParams(location.search);
    const tokenOTP = queryParams.get("tokenOTP");
    const token = queryParams.get("accessToken");

    const confirmEmail = async () => {
      try {
        const response = await axios.get(
          `https://www.dclux.store/api/v1/auth/confirm-email?tokenOTP=${tokenOTP}&accessToken=${token}`,
        );
        setResult("Xác minh tài khoản thành công!");
        setAccessToken(token);
        sessionStorage.setItem("isEmailVerified", "true");
      } catch (error) {
        console.error("Lỗi khi xác minh email:", error);
        setResult("Xác minh tài khoản thất bại. Vui lòng thử lại.");
      }
    };

    if (tokenOTP && token && !hasCalledApi.current) {
      hasCalledApi.current = true;
      confirmEmail();
    } else if (!tokenOTP || !token) {
      setResult("Không tìm thấy token xác minh.");
    }

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
    navigate("/login");
  };

  const handleProductClick = (productId) => {
    navigate(`/detail-product/${productId}`);
  };

  const handleViewProfile = () => {
    navigate("/account", { state: { accessToken } });
  };

  const handleViewCart = () => {
    navigate("/cart", { state: { accessToken } });
  };

  return (
    <div className={styles.container}>
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
            Tới trang đăng nhập
          </button>
        </div>
      </div>

      <div className={styles.productSection}>
        <h2 className={styles.sectionTitle}>
          Vui lòng đăng nhập để có trải nghiệm mua sắm tốt nhất!
        </h2>
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
