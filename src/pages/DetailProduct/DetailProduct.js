import React, { useEffect, useState } from "react";
import styles from "./DetailProduct.module.scss";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";
import { getProductDetail } from "../../services/api/productService";
import { useNavigate, useParams } from "react-router-dom";
import { notification } from "antd";
import Breadcrumb from "../../components/Breadcrumb";

export const DetailProduct = () => {
  const [rating, setRating] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();
  const handleStarClick = (index) => {
    setRating(index);
  };

  const breadcrumbItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Chi tiết sản phẩm" },
  ];

  useEffect(() => {
    const fetchProductDetail = async () => {
      const data = await getProductDetail(id);
      setProduct(data);
    };
    fetchProductDetail();
  }, [id]);

  const checkLoginStatus = () => {
    const accessToken = localStorage.getItem("accessToken");
    const email = localStorage.getItem("userEmail");
    return !!(accessToken && email);
  };

  const handleAddToCart = () => {
    if (!checkLoginStatus()) {
      notification.error({
        message: "Thông báo",
        description: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng",
        duration: 3,
      });
      navigate("/login");
      return;
    }

    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    const existingProductIndex = cartItems.findIndex((item) => item.id === id);

    if (existingProductIndex !== -1) {
      cartItems[existingProductIndex].quantity += quantity;
    } else {
      cartItems.push({
        id: id,
        product: product.data?.product,
        quantity: quantity,
      });
    }

    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    notification.success({
      message: "Thông báo",
      description: "Thêm vào giỏ hàng thành công",
      duration: 3,
    });

    navigate(`/cart/gio-hang-cua-ban`);
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.contentLeft}>
            <Image product={product.data?.product} />
            <div className={styles.detail}>
              <div className={styles.title}>
                {product.data?.product?.product_name}
              </div>
              <div className={styles.review}>
                <div>
                  <span className={styles.code}>Mã: </span>
                  <span className={styles.codeId}>
                    {product.data?.product?.product_code}
                  </span>
                </div>
                <div className={styles.rating}>
                  {[1, 2, 3, 4, 5].map((index) => (
                    <span key={index} onClick={() => handleStarClick(index)}>
                      {index <= rating ? (
                        <StarFilled style={{ color: "#fadb14" }} />
                      ) : (
                        <StarOutlined style={{ color: "#fadb14" }} />
                      )}
                    </span>
                  ))}
                </div>
              </div>
              <form>
                <div className={styles.priceProduct}>
                  <h4 className={styles.price}>
                    {product.data?.product?.product_sale_price <
                      product.data?.product?.product_price &&
                    product.data?.product?.product_sale_price
                      ? new Intl.NumberFormat("vi-VN").format(
                          product.data?.product?.product_sale_price,
                        )
                      : new Intl.NumberFormat("vi-VN").format(
                          product.data?.product?.product_price,
                        )}
                    <span className={styles.dong}>đ</span>
                  </h4>
                </div>
                <div className={styles.notes}>
                  <ul>
                    <li>{product.data?.product?.product_short_description}</li>
                  </ul>
                </div>
                <div className={styles.btns}>
                  <div className={styles.color}>
                    <div>Màu xi/phủ: </div>
                    <div>{product.data?.product?.product_details?.color}</div>
                  </div>
                  <div className={styles.quantity}>
                    <button
                      type="button"
                      className={styles.quantityBtn}
                      onClick={() =>
                        setQuantity((prev) => Math.max(1, prev - 1))
                      }
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className={styles.quantityInput}
                    />
                    <button
                      type="button"
                      className={styles.quantityBtn}
                      onClick={() => setQuantity((prev) => prev + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div>
                    <button
                      type="button"
                      className={styles.btn}
                      onClick={handleAddToCart}
                    >
                      <h1 className={styles.titleBtn}>Thêm vào giỏ hàng</h1>
                    </button>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.chatBtn}`}
                    >
                      <h1
                        style={{ color: "black" }}
                        className={styles.titleBtn}
                      >
                        Chat tư vấn
                      </h1>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className={styles.desc}>
            <DescProduct product={product.data?.product} />
          </div>
        </div>
        {/* <div className={styles.right}>
          <div className={styles.couponBox}>
            <div className={styles.couponTitle}>
              <img
                src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/code_dis.gif?1729756726879"
                alt="gift"
                className={styles.giftIcon}
              />
              <span>MÃ GIẢM GIÁ</span>
            </div>
            <div className={styles.couponItem}>
              <div className={styles.couponInfo}>
                <div className={styles.discount}>GIẢM 10%</div>
                <div className={styles.condition}>Khi mua 2 sản phẩm</div>
                <div className={styles.code}>MUA2GIAM10</div>
              </div>
              <button className={styles.copyBtn}>Copy</button>
            </div>
            <div className={styles.couponItem}>
              <div className={styles.couponInfo}>
                <div className={styles.discount}>FREESHIP</div>
                <div className={styles.condition}>
                  Miễn Phí Vận Chuyển Đơn {">"} 950k
                </div>
                <div className={styles.code}>FREESHIP950K</div>
              </div>
              <button className={styles.copyBtn}>Copy</button>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
};

export const Image = ({ product }) => {
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const images =
    product?.product_details?.product_images.map((img) => img.secure_url) || [];

  useEffect(() => {
    setMainImageIndex(0);
  }, [product]);

  const handlePrevImage = () => {
    setMainImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  };

  const handleNextImage = () => {
    setMainImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
  };

  return (
    <div className={styles.picture}>
      <div className={styles.mainImageContainer}>
        <img
          className={styles.img}
          src={images[mainImageIndex]}
          alt="main-product"
        />
      </div>
      <div className={styles.moreImg}>
        <ul>
          <button onClick={handlePrevImage} className={styles.arrowButton}>
            <ArrowLeftOutlined />
          </button>
          {images.map((imgSrc, index) => (
            <li
              key={index}
              onClick={() => setMainImageIndex(index)}
              className={index === mainImageIndex ? styles.activeThumb : ""}
            >
              <img className={styles.more} src={imgSrc} alt={`more-${index}`} />
            </li>
          ))}
          <button onClick={handleNextImage} className={styles.arrowButton}>
            <ArrowRightOutlined />
          </button>
        </ul>
      </div>
    </div>
  );
};

export const DescProduct = ({ product }) => {
  return (
    <div className={styles.descProduct}>
      <div className={styles.tabs}>
        <div className={styles.tabItem}>MÔ TẢ SẢN PHẨM</div>
        <div className={styles.tabItem}>ĐÁNH GIÁ</div>
      </div>

      <div className={styles.specTable}>
        <h3 className={styles.specTitle}>
          THÔNG SỐ THIẾT KẾ - {product?.product_code}
        </h3>
        <table>
          <tbody>
            <tr>
              <td>Chất liệu</td>
              <td>{product?.product_details?.material}</td>
            </tr>
            <tr>
              <td>Màu sắc</td>
              <td>{product?.product_details?.color}</td>
            </tr>
            <tr>
              <td>Độ dài dây</td>
              <td>{product?.product_details?.length}</td>
            </tr>
            <tr>
              <td>Cách bảo quản & chăm sóc</td>
              <td>{product?.product_details?.care_instructions}</td>
            </tr>
            <tr>
              <td>Kích thước của mặt đá</td>
              <td>{product?.product_details?.stone_size}</td>
            </tr>
            <tr>
              <td>Loại đá</td>
              <td>{product?.product_details?.stone_type}</td>
            </tr>
            <tr>
              <td>Phong cách thiết kế</td>
              <td>{product?.product_details?.design_style}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
