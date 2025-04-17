import { getProductList } from "../../services/api/productService";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.scss";

const ThankYou = () => {
  const [result, setResult] = useState("");
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProductList(1, 1000);
        setProducts(response.data.slice(0, 4)); // Chỉ lấy 4 sản phẩm đầu tiên
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error);
        setProducts([]);
      }
    };

    const processPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const paymentParams = [
        "vnp_Amount",
        "vnp_BankCode",
        "vnp_BankTranNo",
        "vnp_CardType",
        "vnp_OrderInfo",
        "vnp_PayDate",
        "vnp_ResponseCode",
        "vnp_TmnCode",
        "vnp_TransactionNo",
        "vnp_TransactionStatus",
        "vnp_TxnRef",
        "vnp_SecureHash",
      ];

      const paymentData = {};
      paymentParams.forEach((param) => {
        paymentData[param] = params.get(param);
      });

      const { vnp_TxnRef, vnp_ResponseCode, vnp_SecureHash, vnp_Amount } =
        paymentData;

      if (vnp_TxnRef && vnp_ResponseCode && vnp_SecureHash && vnp_Amount) {
        try {
          const response = await axios.get(
            "http://35.247.185.8/api/vnpay/vnpay_ipn",
            {
              params: paymentData,
            },
          );
          localStorage.setItem("userId", response.data.invoice.user);
          setResult(JSON.stringify(response.data));
        } catch (error) {
          setResult(`Có lỗi xảy ra khi xử lý thanh toán: ${error.message}`);
        }
      } else {
        setResult("Không có thông tin thanh toán.");
      }
    };

    processPayment();
    fetchProducts();
  }, []);

  const handleViewProducts = () => {
    navigate("/list-product");
  };

  const handleProductClick = (productId) => {
    navigate(`/detail-product/${productId}`);
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
            Cảm ơn bạn đã xác minh tài khoản thành công!
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
