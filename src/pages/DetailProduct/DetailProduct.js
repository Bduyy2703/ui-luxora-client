import React, { useEffect, useState } from "react";
import styles from "./DetailProduct.module.scss";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { notification } from "antd";
import Breadcrumb from "../../components/Breadcrumb";
import { getByIdProduct } from "../../services/api/productService";
import { addToCart } from "../../services/api/cartService";

export const DetailProduct = () => {
  const [rating, setRating] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState({});
  const [selectedColor, setSelectedColor] = useState(null);
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
      try {
        const data = await getByIdProduct(id);
        console.log("data", data);
        setProduct(data);
        if (data.productDetails && data.productDetails.length > 0) {
          setSelectedColor(data.productDetails[0].color);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        notification.error({
          message: "Thông báo",
          description: "Không thể tải thông tin sản phẩm",
          duration: 3,
        });
      }
    };
    fetchProductDetail();
  }, [id]);

  const checkLoginStatus = () => {
    const accessToken = localStorage.getItem("accessToken");
    const email = localStorage.getItem("userEmail");
    return !!(accessToken && email);
  };

  // const handleAddToCart = () => {
  //   if (!checkLoginStatus()) {
  //     notification.error({
  //       message: "Thông báo",
  //       description: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng",
  //       duration: 3,
  //     });
  //     navigate("/login");
  //     return;
  //   }

  //   const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  //   // Kiểm tra dựa trên id, selectedColor và selectedSize
  //   const existingProductIndex = cartItems.findIndex(
  //     (item) =>
  //       item.id === id &&
  //       item.selectedColor === selectedColor &&
  //       item.selectedSize ===
  //         product.productDetails?.find(
  //           (detail) => detail.color === selectedColor,
  //         )?.size,
  //   );

  //   if (existingProductIndex !== -1) {
  //     // Nếu đã tồn tại cùng id, color và size, tăng số lượng
  //     cartItems[existingProductIndex].quantity += quantity;
  //   } else {
  //     // Nếu khác color hoặc size, tạo mục mới
  //     cartItems.push({
  //       id: id,
  //       product: product,
  //       quantity: quantity,
  //       selectedColor: selectedColor,
  //       selectedSize: product.productDetails?.find(
  //         (detail) => detail.color === selectedColor,
  //       )?.size,
  //     });
  //   }

  //   localStorage.setItem("cartItems", JSON.stringify(cartItems));

  //   notification.success({
  //     message: "Thông báo",
  //     description: "Thêm vào giỏ hàng thành công",
  //     duration: 3,
  //   });

  //   navigate(`/cart/gio-hang-cua-ban`);
  // };

  const handleAddToCart = async () => {
    if (!checkLoginStatus()) {
      notification.error({
        message: "Thông báo",
        description: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng",
        duration: 3,
      });
      navigate("/login");
      return;
    }

    try {
      const selectedDetail = product.productDetails?.find(
        (detail) => detail.color === selectedColor,
      );

      if (!selectedDetail) {
        notification.error({
          message: "Thông báo",
          description: "Không tìm thấy thông tin sản phẩm phù hợp",
          duration: 3,
        });
        return;
      }

      const cartData = {
        productDetailsId: selectedDetail.id,
        quantity: quantity,
      };

      const response = await addToCart(cartData);

      if (response) {
        notification.success({
          message: "Thông báo",
          description: "Thêm vào giỏ hàng thành công",
          duration: 3,
        });
        navigate(`/cart/gio-hang-cua-ban`);
      } else {
        throw new Error("Thêm vào giỏ hàng thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      notification.error({
        message: "Thông báo",
        description: "Thêm vào giỏ hàng thất bại, vui lòng thử lại",
        duration: 3,
      });
    }
  };

  const colorOptions = [
    ...new Set(product.productDetails?.map((detail) => detail.color) || []),
  ];

  const selectedSize = product.productDetails?.find(
    (detail) => detail.color === selectedColor,
  )?.size;

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.contentLeft}>
            <Image product={product} />
            <div className={styles.detail}>
              <div className={styles.title}>
                {product.name || "Tên sản phẩm"}
              </div>
              <div className={styles.review}>
                <div>
                  <span className={styles.code}>Mã: </span>
                  <span className={styles.codeId}>{product.id || "N/A"}</span>
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
                    {new Intl.NumberFormat("vi-VN").format(product.finalPrice)}
                    <span className={styles.dong}>đ</span>
                  </h4>
                </div>
                <div className={styles.notes}>
                  <ul>
                    <li>
                      {product.productDetails?.[0]?.description ||
                        "Mô tả ngắn gọn về sản phẩm"}
                    </li>
                  </ul>
                </div>
                <div className={styles.btns}>
                  <div className={styles.color}>
                    <div>Màu sắc: </div>
                    <div className={styles.colorOptions}>
                      {colorOptions.map((color, index) => (
                        <label key={index} className={styles.colorOption}>
                          <input
                            type="radio"
                            name="color"
                            value={color}
                            checked={selectedColor === color}
                            onChange={() => setSelectedColor(color)}
                          />
                          <span>{color}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {selectedColor && (
                    <div className={styles.size}>
                      <div>Kích thước: </div>
                      <div>{selectedSize || "N/A"}</div>
                    </div>
                  )}
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
            <DescProduct product={product} />
          </div>
        </div>
      </div>
    </>
  );
};

export const Image = ({ product }) => {
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const images = (product?.images || []).map((img) => img.fileUrl);
  console.log("Images in DetailProduct:", images);

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
          src={images[mainImageIndex] || "https://via.placeholder.com/300"}
          alt="main-product"
          onError={(e) => {
            console.log("Error loading main image:", images[mainImageIndex]);
            e.target.src = "https://via.placeholder.com/300";
          }}
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
              <img
                className={styles.more}
                src={imgSrc}
                alt={`more-${index}`}
                onError={(e) => {
                  console.log("Error loading thumbnail image:", imgSrc);
                  e.target.src = "https://via.placeholder.com/100";
                }}
              />
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
          THÔNG SỐ THIẾT KẾ - {product?.id || "N/A"}
        </h3>
        <table>
          <tbody>
            <tr>
              <td>Chất liệu</td>
              <td>{product?.productDetails?.[0]?.material || "N/A"}</td>
            </tr>
            <tr>
              <td>Màu sắc</td>
              <td>{product?.productDetails?.[0]?.color || "N/A"}</td>
            </tr>
            <tr>
              <td>Độ dài dây</td>
              <td>{product?.productDetails?.[0]?.length || "N/A"} cm</td>
            </tr>
            <tr>
              <td>Kích thước (DxRxC)</td>
              <td>
                {product?.productDetails?.[0]?.length || "N/A"} x{" "}
                {product?.productDetails?.[0]?.width || "N/A"} x{" "}
                {product?.productDetails?.[0]?.height || "N/A"} cm
              </td>
            </tr>
            <tr>
              <td>Trọng lượng</td>
              <td>{product?.productDetails?.[0]?.weight || "N/A"} g</td>
            </tr>
            <tr>
              <td>Cách bảo quản & chăm sóc</td>
              <td>
                {product?.productDetails?.[0]?.care_instructions || "N/A"}
              </td>
            </tr>
            <tr>
              <td>Kích thước của mặt đá</td>
              <td>{product?.productDetails?.[0]?.stone_size || "N/A"}</td>
            </tr>
            <tr>
              <td>Loại đá</td>
              <td>{product?.productDetails?.[0]?.stone_type || "N/A"}</td>
            </tr>
            <tr>
              <td>Phong cách thiết kế</td>
              <td>{product?.productDetails?.[0]?.design_style || "N/A"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
