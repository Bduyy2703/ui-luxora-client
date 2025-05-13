import { HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Modal, Pagination, notification } from "antd";
import { useEffect, useState } from "react";
import { defineMessages } from "react-intl";
import { useNavigate } from "react-router-dom";
import styles from "./wishList.module.scss";
import {
  getWishList,
  deleteWishList,
} from "../../../services/api/wishListService";
import { addToCart } from "../../../services/api/cartService";

const messages = defineMessages({
  jewelryTitle: {
    id: "src.pages.Login.index.jewelry",
    defaultMessage: "Jewelry",
  },
});

const WishListPage = () => {
  const [wishList, setWishList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartLoadingMap, setCartLoadingMap] = useState({});
  const itemsPerPage = 9; // Adjusted for 3x3 grid
  const navigate = useNavigate();

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = wishList.slice(indexOfFirstItem, indexOfLastItem);

  const fetchWishList = async () => {
    setLoading(true);
    try {
      const response = await getWishList();
      setWishList(response || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách yêu thích:", error);
      notification.error({
        message: "Thông báo",
        description: "Không thể tải danh sách sản phẩm yêu thích",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (productDetailId) => {
    Modal.confirm({
      title: "Xóa sản phẩm",
      content: "Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteWishList(productDetailId);
          setWishList(
            wishList.filter(
              (item) => item.productDetail.id !== productDetailId,
            ),
          );
          notification.success({
            message: "Thông báo",
            description: "Đã xóa sản phẩm khỏi danh sách yêu thích",
            duration: 3,
          });
        } catch (error) {
          console.error("Lỗi khi xóa sản phẩm yêu thích:", error);
          notification.error({
            message: "Thông báo",
            description: "Không thể xóa sản phẩm khỏi danh sách yêu thích",
            duration: 3,
          });
        }
      },
    });
  };

  const checkLoginStatus = () => {
    const accessToken = localStorage.getItem("accessToken");
    const email = localStorage.getItem("userEmail");
    return !!(accessToken && email);
  };

  const handleAddToCart = async (productDetailId) => {
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
      const item = wishList.find(
        (item) => item.productDetail.id === productDetailId,
      );
      if (!item) {
        notification.error({
          message: "Thông báo",
          description: "Không tìm thấy thông tin sản phẩm",
          duration: 3,
        });
        return;
      }

      if (item.productDetail.stock < 1) {
        notification.error({
          message: "Thông báo",
          description: "Sản phẩm hiện đã hết hàng",
          duration: 3,
        });
        return;
      }

      setCartLoadingMap((prev) => ({ ...prev, [productDetailId]: true }));
      const cartData = {
        productDetailsId: productDetailId,
        quantity: 1,
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
      setCartLoadingMap((prev) => ({ ...prev, [productDetailId]: false }));
    }
  };

  const handleViewDetail = (productId) => {
    navigate(`/detail-product/${productId}`);
  };

  const handleExploreProducts = () => {
    navigate("/list-product");
  };

  useEffect(() => {
    fetchWishList();
  }, []);

  return (
    <div className={styles.profile}>
      <header className={styles.header}>
        <h1 className={styles.title}>Sản phẩm yêu thích</h1>
        <div className={styles.headerActions}>
          <HeartOutlined className={styles.wishListIcon} />
          <span style={{ color: "#2b2b2b" }}>
            Sản phẩm yêu thích ({wishList.length})
          </span>
        </div>
      </header>
      <div className={styles.profileUser}>
        <div className={styles.wishList}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <span>Đang tải danh sách yêu thích...</span>
            </div>
          ) : currentItems.length === 0 ? (
            <div className={styles.emptyState}>
              <h2>Chưa có sản phẩm yêu thích</h2>
              <p>Thêm những món trang sức yêu thích vào danh sách của bạn!</p>
              <button
                className={styles.exploreButton}
                onClick={handleExploreProducts}
                aria-label="Khám phá sản phẩm ngay"
              >
                <div>Khám Phá Ngay</div>
              </button>
            </div>
          ) : (
            currentItems.map((item, index) => {
              const discount =
                item.productDetail.product.originalPrice !==
                item.productDetail.product.finalPrice
                  ? Math.round(
                      ((item.productDetail.product.originalPrice -
                        item.productDetail.product.finalPrice) /
                        item.productDetail.product.originalPrice) *
                        100,
                    )
                  : 0;

              const isLoading = !!cartLoadingMap[item.productDetail.id];

              return (
                <div
                  key={item.id}
                  className={styles.wishItem}
                  style={{ animationDelay: `${index * 0.2}s` }}
                  aria-label={`Sản phẩm ${item.productDetail.product.name}`}
                >
                  <div
                    className={styles.imageWrapper}
                    onClick={() =>
                      handleViewDetail(item.productDetail.product.id)
                    }
                    role="button"
                    tabIndex={0}
                    aria-label={`Xem chi tiết ${item.productDetail.product.name}`}
                  >
                    <img
                      src={item.images[0]}
                      alt={item.productDetail.product.name}
                      className={styles.productImage}
                    />
                    {discount > 0 && (
                      <span className={styles.discountBadge}>-{discount}%</span>
                    )}
                    <div className={styles.imageOverlay}>
                      <span>Xem Chi Tiết</span>
                    </div>
                  </div>
                  <div className={styles.productInfo}>
                    <div
                      className={styles.productName}
                      onClick={() =>
                        handleViewDetail(item.productDetail.product.id)
                      }
                      role="button"
                      tabIndex={0}
                      aria-label={`Xem chi tiết ${item.productDetail.product.name}`}
                    >
                      {item.productDetail.product.name}
                    </div>
                    <div className={styles.productDetail}>
                      <span>Kích thước: {item.productDetail.size}</span>
                      <span>Màu sắc: {item.productDetail.color}</span>
                      <span>Kho: {item.productDetail.stock}</span>
                    </div>
                    <div className={styles.priceWrapper}>
                      <span className={styles.finalPrice}>
                        {new Intl.NumberFormat("vi-VN").format(
                          item.productDetail.product.finalPrice,
                        )}
                        <span className={styles.dong}>đ</span>
                      </span>
                      {discount > 0 && (
                        <span className={styles.originalPrice}>
                          {new Intl.NumberFormat("vi-VN").format(
                            item.productDetail.product.originalPrice,
                          )}
                          <span className={styles.dong}>đ</span>
                        </span>
                      )}
                    </div>
                    <div className={styles.actions}>
                      <button
                        className={styles.addToCart}
                        onClick={() => handleAddToCart(item.productDetail.id)}
                        disabled={isLoading || item.productDetail.stock === 0}
                        aria-label={
                          isLoading
                            ? "Đang xử lý thêm vào giỏ hàng"
                            : "Thêm vào giỏ hàng"
                        }
                      >
                        {isLoading ? (
                          <span className={styles.loader}></span>
                        ) : (
                          <ShoppingCartOutlined />
                        )}
                        {isLoading ? "Đang xử lý..." : "Thêm vào giỏ"}
                      </button>
                      <button
                        className={styles.removeFavorite}
                        onClick={() => handleDelete(item.productDetail.id)}
                        aria-label={`Bỏ yêu thích ${item.productDetail.product.name}`}
                      >
                        Bỏ yêu thích
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {wishList.length > itemsPerPage && (
          <Pagination
            current={currentPage}
            pageSize={itemsPerPage}
            total={wishList.length}
            onChange={handlePageChange}
            className={styles.pagination}
            aria-label="Phân trang danh sách yêu thích"
          />
        )}
        {/* {!loading && currentItems.length > 0 && (
          <div className={styles.recommendations}>
            <h2 className={styles.recommendationsTitle}>Có Thể Bạn Sẽ Thích</h2>
            <div className={styles.recommendationsGrid}>
              <div className={styles.recommendationItem}>
                <img
                  src="https://via.placeholder.com/300x300?text=Product+1"
                  alt="Sản phẩm đề xuất 1"
                  className={styles.recommendationImage}
                />
                <div className={styles.recommendationInfo}>
                  <span className={styles.recommendationName}>
                    Nhẫn Vàng 18K
                  </span>
                  <span className={styles.recommendationPrice}>2.500.000đ</span>
                </div>
              </div>
              <div className={styles.recommendationItem}>
                <img
                  src="https://via.placeholder.com/300x300?text=Product+2"
                  alt="Sản phẩm đề xuất 2"
                  className={styles.recommendationImage}
                />
                <div className={styles.recommendationInfo}>
                  <span className={styles.recommendationName}>
                    Bông Tai Kim Cương
                  </span>
                  <span className={styles.recommendationPrice}>5.000.000đ</span>
                </div>
              </div>
              <div className={styles.recommendationItem}>
                <img
                  src="https://via.placeholder.com/300x300?text=Product+3"
                  alt="Sản phẩm đề xuất 3"
                  className={styles.recommendationImage}
                />
                <div className={styles.recommendationInfo}>
                  <span className={styles.recommendationName}>
                    Dây Chuyền Ngọc Trai
                  </span>
                  <span className={styles.recommendationPrice}>3.200.000đ</span>
                </div>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default WishListPage;
