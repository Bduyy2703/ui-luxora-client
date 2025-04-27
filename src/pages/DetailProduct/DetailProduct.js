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
import {
  getByIdProduct,
  getProductList,
} from "../../services/api/productService";
import { addToCart } from "../../services/api/cartService";
import { motion, AnimatePresence } from "framer-motion";
import { addWishList, checkWishList } from "../../services/api/wishListService";
import ReviewProduct from "./ReviewProduct";
import {
  getProductReviewStatistics,
  getReviewsByProductId,
} from "../../services/api/reviewService";

export const DetailProduct = () => {
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState({});
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("description");
  const [isFavorite, setIsFavorite] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
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
        setProduct(data);
        if (data.productDetails && data.productDetails.length > 0) {
          setSelectedColor(data.productDetails[0].color);
          setSelectedSize(data.productDetails[0].size);
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

  useEffect(() => {
    const checkWishlistStatus = async () => {
      const selectedDetail = product.productDetails?.find(
        (detail) =>
          detail.color === selectedColor && detail.size === selectedSize,
      );
      if (selectedDetail) {
        try {
          const response = await checkWishList(selectedDetail.id);
          console.log("Response:", response);

          setIsFavorite(response.isFavorite || false);
        } catch (error) {
          console.error("Error checking wishlist status:", error);
          setIsFavorite(false);
        }
      }
    };

    if (selectedColor && selectedSize) {
      checkWishlistStatus();
    }
  }, [selectedColor, selectedSize, product.productDetails]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await getProductList(1, 10);
        const products = response.data || [];
        const related = products.filter(
          (item) =>
            item.category.id === product.category?.id &&
            item.id !== parseInt(id),
        );
        setRelatedProducts(related);
      } catch (error) {
        console.error("Error fetching related products:", error);
        notification.error({
          message: "Thông báo",
          description: "Không thể tải danh sách sản phẩm liên quan",
          duration: 3,
        });
      }
    };

    if (product.category?.id) {
      fetchRelatedProducts();
    }
  }, [product.category?.id, id]);

  const checkLoginStatus = () => {
    const accessToken = localStorage.getItem("accessToken");
    const email = localStorage.getItem("userEmail");
    return !!(accessToken && email);
  };

  const handleToggleWishlist = async () => {
    if (!checkLoginStatus()) {
      notification.error({
        message: "Thông báo",
        description:
          "Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích",
        duration: 3,
      });
      navigate("/login");
      return;
    }

    const selectedDetail = product.productDetails?.find(
      (detail) =>
        detail.color === selectedColor && detail.size === selectedSize,
    );

    if (!selectedDetail) {
      notification.error({
        message: "Thông báo",
        description: "Không tìm thấy thông tin sản phẩm phù hợp",
        duration: 3,
      });
      return;
    }

    try {
      setWishlistLoading(true);
      await addWishList(selectedDetail.id);
      setIsFavorite(!isFavorite);
      notification.success({
        message: "Thông báo",
        description: isFavorite
          ? "Đã bỏ yêu thích sản phẩm"
          : "Đã thêm sản phẩm vào danh sách yêu thích",
        duration: 3,
      });
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      notification.error({
        message: "Thông báo",
        description: "Thao tác thất bại, vui lòng thử lại",
        duration: 3,
      });
    } finally {
      setWishlistLoading(false);
    }
  };

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
        (detail) =>
          detail.color === selectedColor && detail.size === selectedSize,
      );

      if (!selectedDetail) {
        notification.error({
          message: "Thông báo",
          description: "Không tìm thấy thông tin sản phẩm phù hợp",
          duration: 3,
        });
        return;
      }

      if (selectedDetail.stock < quantity) {
        notification.error({
          message: "Thông báo",
          description: `Số lượng tồn kho chỉ còn ${selectedDetail.stock} sản phẩm`,
          duration: 3,
        });
        return;
      }

      setLoading(true);
      const cartData = {
        productDetailsId: selectedDetail.id,
        quantity: quantity,
      };

      await addToCart(cartData);

      notification.success({
        message: "Thông báo",
        description: "Thêm vào giỏ hàng thành công",
        duration: 3,
      });
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      notification.error({
        message: "Thông báo",
        description: "Thêm vào giỏ hàng thất bại, vui lòng thử lại",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = [
    ...new Set(product.productDetails?.map((detail) => detail.color) || []),
  ];

  const sizeOptions =
    product.productDetails
      ?.filter((detail) => detail.color === selectedColor)
      ?.map((detail) => detail.size) || [];

  const handleColorChange = (color) => {
    setSelectedColor(color);
    const defaultSize =
      product.productDetails?.find((detail) => detail.color === color)?.size ||
      "";
    setSelectedSize(defaultSize);
  };

  const handleSizeChange = (e) => {
    setSelectedSize(e.target.value);
  };

  const selectedVariant = product.productDetails?.find(
    (detail) => detail.color === selectedColor && detail.size === selectedSize,
  );
  const variantStock = selectedVariant ? selectedVariant.stock : 0;
  const isOutOfStock = variantStock === 0;

  console.log("isFavorite", isFavorite);

  return (
    <motion.div
      className={styles.wrapper}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Breadcrumb items={breadcrumbItems} />
      <div className={styles.container}>
        <div className={styles.contentLeft}>
          <Image product={product} />
          <motion.div
            className={styles.detail}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className={styles.title}>{product.name || "Tên sản phẩm"}</h1>
            <div className={styles.review}>
              <div>
                <span className={styles.code}>Mã: </span>
                <span className={styles.codeId}>{product.id || "N/A"}</span>
              </div>
              <div className={styles.rating}>
                {[1, 2, 3, 4, 5].map((index) => (
                  <motion.span
                    key={index}
                    onClick={() => handleStarClick(index)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {index <= rating ? (
                      <StarFilled style={{ color: "#fadb14" }} />
                    ) : (
                      <StarOutlined style={{ color: "#fadb14" }} />
                    )}
                  </motion.span>
                ))}
                <span className={styles.sold}>
                  {product.totalSold || 0} Đã bán
                </span>
              </div>
            </div>
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
                    <motion.label
                      key={index}
                      className={styles.colorOption}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <input
                        type="radio"
                        name="color"
                        value={color}
                        checked={selectedColor === color}
                        style={{ marginTop: "1px" }}
                        onChange={() => handleColorChange(color)}
                      />
                      <span>{color}</span>
                    </motion.label>
                  ))}
                </div>
              </div>
              {selectedColor && (
                <div className={styles.size}>
                  <div>Kích thước: </div>
                  <motion.select
                    value={selectedSize}
                    onChange={handleSizeChange}
                    className={styles.sizeDropdown}
                    disabled={sizeOptions.length === 0}
                    whileHover={{ scale: 1.02 }}
                  >
                    {sizeOptions.length === 0 ? (
                      <option value="">Không có kích thước</option>
                    ) : (
                      sizeOptions.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))
                    )}
                  </motion.select>
                </div>
              )}
              <div className={styles.quantityWrapper}>
                <div className={styles.quantityLabel}>Số lượng: </div>
                <div className={styles.quantity}>
                  <motion.button
                    type="button"
                    className={styles.quantityBtn}
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    -
                  </motion.button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className={styles.quantityInput}
                    disabled={isOutOfStock}
                  />
                  <motion.button
                    type="button"
                    className={styles.quantityBtn}
                    onClick={() => setQuantity((prev) => prev + 1)}
                    disabled={isOutOfStock}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    +
                  </motion.button>
                </div>
                <div className={styles.stock}>
                  {isOutOfStock
                    ? "(Hết hàng)"
                    : `(${variantStock} sản phẩm có sẵn)`}
                </div>
              </div>
              <div className={styles.actionButtons}>
                <motion.button
                  type="button"
                  className={styles.btn}
                  onClick={handleAddToCart}
                  style={{
                    background: isOutOfStock ? "gray" : "",
                    cursor: isOutOfStock ? "not-allowed" : "pointer",
                  }}
                  disabled={loading || isOutOfStock}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95, rotate: 2 }}
                >
                  <h1 className={styles.titleBtn}>
                    {loading ? "Đang xử lý..." : "Thêm vào giỏ hàng"}
                  </h1>
                </motion.button>
                <motion.button
                  type="button"
                  className={`${styles.btn} ${styles.chatBtn}`}
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <h1 className={styles.titleBtn}>
                    {wishlistLoading
                      ? "Đang xử lý..."
                      : isFavorite
                        ? "Bỏ yêu thích"
                        : "Yêu thích"}
                  </h1>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
        <motion.div
          className={styles.desc}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <DescProduct
            product={product}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <RelatedProducts products={relatedProducts} />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Các component khác (Image, DescProduct, RelatedProducts) giữ nguyên

export const Image = ({ product }) => {
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const images = (product?.images || []).map((img) => img.fileUrl);

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
      <motion.div
        className={styles.mainImageContainer}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={mainImageIndex}
            className={styles.img}
            src={images[mainImageIndex] || "https://via.placeholder.com/300"}
            alt="main-product"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300";
            }}
          />
        </AnimatePresence>
      </motion.div>
      <div className={styles.moreImg}>
        <ul>
          <motion.button
            onClick={handlePrevImage}
            className={styles.arrowButton}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeftOutlined />
          </motion.button>
          {images.map((imgSrc, index) => (
            <motion.li
              key={index}
              onClick={() => setMainImageIndex(index)}
              className={index === mainImageIndex ? styles.activeThumb : ""}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <img
                className={styles.more}
                src={imgSrc}
                alt={`more-${index}`}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/100";
                }}
              />
            </motion.li>
          ))}
          <motion.button
            onClick={handleNextImage}
            className={styles.arrowButton}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowRightOutlined />
          </motion.button>
        </ul>
      </div>
    </div>
  );
};

export const DescProduct = ({ product, activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      if (activeTab === "reviews" && product.id) {
        setLoading(true);
        try {
          const response = await getReviewsByProductId(product.id, 1, 5); // Limit to 5 reviews for preview
          if (response.error) {
            notification.error({
              message: "Thông báo",
              description: response.error,
              duration: 3,
            });
            return;
          }
          setReviews(response.reviews || []);
          setTotalReviews(response.total || 0);
        } catch (error) {
          notification.error({
            message: "Thông báo",
            description: "Lỗi khi tải đánh giá",
            duration: 3,
          });
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchStatistics = async () => {
      if (product.id) {
        try {
          const response = await getProductReviewStatistics(product.id);
          if (response.error) {
            notification.error({
              message: "Thông báo",
              description: response.error,
              duration: 3,
            });
            return;
          }
          setAverageRating(response.averageRating || 0);
        } catch (error) {
          notification.error({
            message: "Thông báo",
            description: "Lỗi khi tải thống kê đánh giá",
            duration: 3,
          });
        }
      }
    };

    fetchReviews();
    fetchStatistics();
  }, [product.id, activeTab]);

  return (
    <div className={styles.descProduct}>
      <div className={styles.tabs}>
        <motion.div
          className={`${styles.tabItem} ${activeTab === "description" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("description")}
          whileHover={{ color: "#71bec2" }}
          whileTap={{ scale: 0.95 }}
        >
          MÔ TẢ SẢN PHẨM
        </motion.div>
        <motion.div
          className={`${styles.tabItem} ${activeTab === "reviews" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("reviews")}
          whileHover={{ color: "#71bec2" }}
          whileTap={{ scale: 0.95 }}
        >
          ĐÁNH GIÁ
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "description" ? (
          <motion.div
            key="description"
            className={styles.specTable}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className={styles.specTitle}>THÔNG SỐ THIẾT KẾ</h3>
            <table>
              <tbody>
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
          </motion.div>
        ) : (
          // <motion.div
          //   key="reviews"
          //   className={styles.reviews}
          //   initial={{ opacity: 0, y: 20 }}
          //   animate={{ opacity: 1, y: 0 }}
          //   exit={{ opacity: 0, y: -20 }}
          //   transition={{ duration: 0.3 }}
          // >
          //   <div className="mb-4">
          //     <p className="text-lg font-semibold">
          //       Điểm trung bình: {averageRating.toFixed(1)} / 5 ({totalReviews}{" "}
          //       đánh giá)
          //     </p>
          //     {loading ? (
          //       <p>Đang tải đánh giá...</p>
          //     ) : reviews.length === 0 ? (
          //       <p>Chưa có đánh giá nào cho sản phẩm này.</p>
          //     ) : (
          //       reviews.map((review) => (
          //         <div key={review.id} className="border-b py-2">
          //           <div className="flex">
          //             {[1, 2, 3, 4, 5].map((star) => (
          //               <span key={star}>
          //                 {star <= review.rating ? (
          //                   <StarFilled style={{ color: "#fadb14" }} />
          //                 ) : (
          //                   <StarOutlined style={{ color: "#fadb14" }} />
          //                 )}
          //               </span>
          //             ))}
          //           </div>
          //           <p>{review.comment}</p>
          //           {review.images && review.images.length > 0 && (
          //             <div className="flex mt-2 space-x-2">
          //               {review.images.map((img, idx) => (
          //                 <img
          //                   key={idx}
          //                   src={img.fileUrl}
          //                   alt={`review-${idx}`}
          //                   className="w-16 h-16 object-cover rounded-md"
          //                   loading="lazy"
          //                   onError={(e) =>
          //                     (e.target.src = "https://via.placeholder.com/100")
          //                   }
          //                 />
          //               ))}
          //             </div>
          //           )}
          //           <p className="text-sm text-gray-500">
          //             Đăng bởi {review.user?.name || "Người dùng"} vào{" "}
          //             {new Date(review.createdAt).toLocaleDateString("vi-VN")}
          //           </p>
          //         </div>
          //       ))
          //     )}
          //     {totalReviews > 5 && (
          //       <motion.button
          //         onClick={() => navigate(`/reviews/${product.id}`)}
          //         className="mt-4 text-blue-600 hover:underline"
          //         whileHover={{ scale: 1.05 }}
          //         whileTap={{ scale: 0.95 }}
          //       >
          //         Xem tất cả đánh giá
          //       </motion.button>
          //     )}
          //   </div>
          // </motion.div>
          <ReviewProduct product={product} />
        )}
      </AnimatePresence>
    </div>
  );
};
export const RelatedProducts = ({ products }) => {
  const navigate = useNavigate();

  const handleProductClick = (id) => {
    navigate(`/detail-product/${id}`);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <motion.div
      className={styles.relatedProducts}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <h3 className={styles.relatedTitle}>SẢN PHẨM LIÊN QUAN</h3>
      <div className={styles.productGrid}>
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            className={styles.productCard}
            onClick={() => handleProductClick(product.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              className={styles.productImage}
              src={product.images[0] || "https://via.placeholder.com/150"}
              alt={product.name}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150";
              }}
            />
            <div className={styles.productInfo}>
              <h4 className={styles.productName}>{product.name}</h4>
              <p className={styles.productPrice}>
                {new Intl.NumberFormat("vi-VN").format(product.finalPrice)}đ
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
