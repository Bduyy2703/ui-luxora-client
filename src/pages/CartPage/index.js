import React, { useState, useEffect, useMemo } from "react";
import styles from "./CartPage.module.scss";
import cartEmptyImage from "../../assets/icon/cart-empty.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import { fetchDiscounts } from "../../services/api/discountService";
import { fetchPayment } from "../../services/api/checkoutService";
import { getCart } from "../../services/api/cartService";
import { Modal, notification } from "antd";

import placeholderImage from "../../assets/images/daychuyen1/vyn13-t-1-1659674319051.webp"; // Thay bằng đường dẫn thực tế nếu bạn có file placeholder cục bộ

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentItemKey, setCurrentItemKey] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const selectedProductDetailsId = useMemo(
    () => location.state?.selectedProductDetailsId,
    [location.state?.selectedProductDetailsId],
  );

  const breadcrumbItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Giỏ hàng" },
  ];

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await getCart();
        if (response && Array.isArray(response.cartItems)) {
          const filteredItems = selectedProductDetailsId
            ? response.cartItems.filter(
                (item) => item.productDetails.id === selectedProductDetailsId,
              )
            : response.cartItems;
          setCartItems(filteredItems);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu giỏ hàng:", error);
        notification.error({
          message: "Thông báo",
          description: "Không thể tải dữ liệu giỏ hàng, vui lòng thử lại",
          duration: 3,
        });
        setCartItems([]);
      }
    };

    fetchCartItems();
  }, [selectedProductDetailsId]);

  const getItemKey = (item) =>
    `${item.id}-${item.productDetails.color}-${item.productDetails.size}`;

  const handleDecrement = (itemKey) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        const key = getItemKey(item);
        if (key === itemKey && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
      return updatedItems;
    });
  };

  const handleIncrement = (itemKey) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        const key = getItemKey(item);
        if (key === itemKey) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
      return updatedItems;
    });
  };

  const showDeleteConfirm = (itemKey) => {
    setCurrentItemKey(itemKey);
    setIsModalVisible(true);
  };

  const handleRemoveItem = () => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter(
        (item) => getItemKey(item) !== currentItemKey,
      );
      notification.success({
        message: "Thông báo",
        description: "Xóa sản phẩm thành công",
      });
      return updatedItems;
    });
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const groupedItems = cartItems.reduce((acc, item) => {
    const productId = item.productDetails.product.id;
    if (!acc[productId]) {
      acc[productId] = [];
    }
    acc[productId].push(item);
    return acc;
  }, {});

  const totalAmount = useMemo(
    () =>
      cartItems.reduce((total, item) => {
        return (
          total +
          parseFloat(
            item.productDetails.product.finalPrice ||
              item.productDetails.product.originalPrice,
          ) *
            item.quantity
        );
      }, 0),
    [cartItems],
  );

  const [paymentData, setPaymentData] = useState([]);
  const [discount_id, setDiscount_id] = useState(null);

  localStorage.setItem("discount_id", discount_id);

  const handleCheckout = async () => {
    try {
      const emailtoken = localStorage.getItem("userEmail");
      const items = cartItems.map((item) => ({
        product_id: item.productDetails.product.id,
        quantity: item.quantity,
        color: item.productDetails.color,
        size: item.productDetails.size,
      }));

      const response = await fetchPayment({ emailtoken, items, discount_id });

      if (response.error) {
        console.error("Lỗi khi lấy dữ liệu thanh toán:", response.error);
        return;
      }
      setPaymentData(response);

      navigate("/checkout", {
        state: { cartItems, emailtoken, paymentData: response },
      });
    } catch (error) {
      console.error("Lỗi không mong muốn:", error);
    }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className={styles.wrapper}>
        <span className={styles.nameCart}>Giỏ hàng của bạn</span>
        <div className={styles.cart}>
          <div className={styles.cartLeft}>
            {cartItems.length === 0 ? (
              <>
                <div>
                  <img
                    className={styles.img}
                    src={cartEmptyImage}
                    alt="cart1"
                  />
                </div>
                <div className={styles.empty}>
                  Không có sản phẩm nào trong giỏ hàng của bạn
                </div>
              </>
            ) : (
              <>
                <div className={styles.tableHeader}>
                  <div className={styles.headerItem}>THÔNG TIN SẢN PHẨM</div>
                  <div className={styles.headerItem}>ĐƠN GIÁ</div>
                  <div className={styles.headerItem}>SỐ LƯỢNG</div>
                  <div className={styles.headerItem}>THÀNH TIỀN</div>
                </div>
                {Object.keys(groupedItems).map((productId) => {
                  const items = groupedItems[productId];
                  const firstItem = items[0];

                  const colors = [
                    ...new Set(items.map((item) => item.productDetails.color)),
                  ].join(", ");
                  const sizes = [
                    ...new Set(items.map((item) => item.productDetails.size)),
                  ].join(", ");

                  return (
                    <div key={productId} className={styles.productGroup}>
                      <div className={styles.productRow}>
                        <div className={styles.productInfo}>
                          <img
                            className={styles.image}
                            src={
                              firstItem.productDetails.product.images?.[0]
                                ?.fileUrl || placeholderImage // Sử dụng hình ảnh cục bộ thay vì URL không hợp lệ
                            }
                            alt={firstItem.productDetails.product.name}
                            onError={(e) => {
                              // Chỉ gán src nếu nó chưa phải là placeholderImage, tránh vòng lặp
                              if (e.target.src !== placeholderImage) {
                                e.target.src = placeholderImage;
                              }
                            }}
                          />
                          <div className={styles.productDetails}>
                            <div className={styles.name}>
                              {firstItem.productDetails.product.name ||
                                "Tên sản phẩm"}
                            </div>
                            <div className={styles.material}>
                              Màu sắc: {colors || "N/A"}
                              {sizes && <span> | Kích thước: {sizes}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                      {items.map((item) => {
                        const itemKey = getItemKey(item);
                        return (
                          <div key={itemKey} className={styles.variantRow}>
                            <div className={styles.variantInfo}>
                              <span>
                                {item.productDetails.color} -{" "}
                                {item.productDetails.size}
                              </span>
                              <a
                                title="Xóa"
                                className={styles.removeBtn}
                                onClick={() => showDeleteConfirm(itemKey)}
                              >
                                Xóa
                              </a>
                            </div>
                            <div className={styles.price}>
                              {new Intl.NumberFormat("vi-VN").format(
                                parseFloat(
                                  item.productDetails.product.finalPrice ||
                                    item.productDetails.product.originalPrice,
                                ),
                              )}
                              <span className={styles.dong}>đ</span>
                            </div>
                            <div className={styles.quantityControl}>
                              <button
                                className={styles.quantityButton}
                                onClick={() => handleDecrement(itemKey)}
                              >
                                -
                              </button>
                              <span className={styles.quantity}>
                                {item.quantity}
                              </span>
                              <button
                                className={styles.quantityButton}
                                onClick={() => handleIncrement(itemKey)}
                              >
                                +
                              </button>
                            </div>
                            <div className={styles.price}>
                              {new Intl.NumberFormat("vi-VN").format(
                                parseFloat(
                                  (item.productDetails.product.finalPrice ||
                                    item.productDetails.product.originalPrice) *
                                    item.quantity,
                                ),
                              )}
                              <span className={styles.dong}>đ</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                <Modal
                  title="Xác nhận xóa"
                  visible={isModalVisible}
                  onOk={handleRemoveItem}
                  onCancel={handleCancel}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <p>Bạn có chắc chắn muốn xóa không?</p>
                </Modal>
                <div className={styles.bottom}>
                  <Link to="/" className={styles.goOn}>
                    Tiếp tục mua hàng
                  </Link>
                  <div className={styles.subTotal}>
                    <div className={styles.cartSubTotal}>
                      <div>TỔNG TIỀN:</div>
                      <div>
                        <h4 className={styles.price}>
                          {new Intl.NumberFormat("vi-VN").format(totalAmount)}
                          <span className={styles.dong}>đ</span>
                        </h4>
                      </div>
                    </div>
                    <div
                      className={styles.btnCheckout}
                      onClick={handleCheckout}
                    >
                      Thanh toán
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className={styles.cartRight}>
            <DiscountCard
              totalAmount={totalAmount}
              setDiscount_id={setDiscount_id}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const DiscountCard = ({ totalAmount, setDiscount_id }) => {
  const [showDiscounts, setShowDiscounts] = useState(false);
  const [discountData, setDiscountData] = useState([]);

  const fetchDiscount = async () => {
    try {
      const response = await fetchDiscounts({ totalPrice: totalAmount });

      if (response.error) {
        console.error("Lỗi khi lấy dữ liệu giảm giá:", response.error);
        return;
      }
      setDiscountData(response);
    } catch (error) {
      console.error("Lỗi không mong muốn:", error);
    }
  };

  useEffect(() => {
    fetchDiscount();
  }, [totalAmount]);

  const toggleDiscounts = () => {
    setShowDiscounts(!showDiscounts);
    fetchDiscount();
  };

  return (
    <div className={styles.discountCard}>
      <div className={styles.discountCardHeader}>
        <img
          src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/code_dis.gif?1729756726879"
          alt="Gift Icon"
        />
        <button
          style={{
            backgroundColor: "#000",
            color: "#fff",
            borderRadius: "5px",
            padding: "5px 10px",
            width: "100%",
          }}
          onClick={toggleDiscounts}
        >
          MÃ GIẢM GIÁ
        </button>
      </div>
      {showDiscounts && (
        <div className={styles.discountCardContent}>
          {discountData.map((discount, index) => (
            <div key={index} className={styles.discountItem}>
              <div className={styles.discountTitle}>
                Giảm{" "}
                {new Intl.NumberFormat("vi-VN").format(discount.discountAmount)}
                {discount.discountType === "percent" ? "%" : "đ"}
              </div>
              <div className={styles.discountCodeContainer}>
                <div className={styles.discountCode}>
                  <input
                    type="radio"
                    id={`discount-${index}`}
                    name="discount"
                    value={discount.code}
                    style={{ marginRight: "10px", marginTop: "10px" }}
                    onChange={() => setDiscount_id(discount._id)}
                  />
                  <span style={{ marginRight: "10px" }}>Top Code</span>
                  <span>{discount.code}</span>
                  <span>{discount.name}</span>
                  <button className={styles.copyButton}>Áp dụng</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartPage;
