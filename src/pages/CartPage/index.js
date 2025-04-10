import React, { useState, useEffect } from "react";
import styles from "./CartPage.module.scss";
import cartEmptyImage from "../../assets/icon/cart-empty.png";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import { fetchDiscounts } from "../../services/api/discountService";
import { fetchPayment } from "../../services/api/checkoutService";
import { Modal, notification } from "antd";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Giỏ hàng" },
  ];

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(items);
  }, []);

  const handleDecrement = (itemId) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      );
      localStorage.setItem("cartItems", JSON.stringify(updatedItems));
      return updatedItems;
    });
  };

  const handleIncrement = (itemId) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item,
      );
      localStorage.setItem("cartItems", JSON.stringify(updatedItems));
      return updatedItems;
    });
  };

  const showDeleteConfirm = (itemId) => {
    setCurrentItemId(itemId);
    setIsModalVisible(true);
  };

  const handleRemoveItem = () => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter(
        (item) => item.id !== currentItemId,
      );
      localStorage.setItem("cartItems", JSON.stringify(updatedItems));
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

  const totalAmount = cartItems.reduce((total, item) => {
    return (
      total +
      (item.product.finalPrice || item.product.originalPrice) * item.quantity
    );
  }, 0);

  const [paymentData, setPaymentData] = useState([]);

  const [discount_id, setDiscount_id] = useState(null);

  localStorage.setItem("discount_id", discount_id);

  const handleCheckout = async () => {
    try {
      const emailtoken = localStorage.getItem("userEmail");
      const items = cartItems.map((item) => ({
        product_id: item?.id,
        quantity: item.quantity,
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
                <div className={styles.top}>
                  <div style={{ fontWeight: "500" }}>Thông tin sản phẩm</div>
                  <div style={{ fontWeight: "500" }} className={styles.pricee}>
                    Đơn giá
                  </div>
                  <div style={{ fontWeight: "500" }}>Số lượng</div>
                  <div style={{ fontWeight: "500" }}>Thành tiền</div>
                </div>
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.middle}>
                    <div className={styles.middleRow}>
                      <img
                        className={styles.image}
                        src={
                          item.product.images?.[0] ||
                          "https://via.placeholder.com/100" // Truy cập images trực tiếp
                        }
                        alt={item.product.name}
                      />
                    </div>
                    <div className={styles.content}>
                      <div className={styles.contentLeft}>
                        <div className={styles.name}>
                          {item.product.name || "Tên sản phẩm"}
                        </div>
                        <span className={styles.material}>
                          {item.product.productDetails?.[0]?.color || "N/A"}
                        </span>
                        <a
                          title="Xóa"
                          className={styles.btn}
                          onClick={() => showDeleteConfirm(item.id)}
                        >
                          Xóa
                        </a>
                      </div>
                      <div className={styles.contentRight}>
                        <div>
                          <h4 className={styles.price}>
                            {new Intl.NumberFormat("vi-VN").format(
                              item.product.finalPrice ||
                                item.product.originalPrice,
                            )}
                            <span className={styles.dong}>đ</span>
                          </h4>
                        </div>
                        <div className={styles.quantityControl}>
                          <button
                            className={styles.quantityButton}
                            onClick={() => handleDecrement(item.id)}
                          >
                            -
                          </button>
                          <span className={styles.quantity}>
                            {item.quantity}
                          </span>
                          <button
                            className={styles.quantityButton}
                            onClick={() => handleIncrement(item.id)}
                          >
                            +
                          </button>
                        </div>
                        <div>
                          <h4 className={styles.price}>
                            {new Intl.NumberFormat("vi-VN").format(
                              (item.product.finalPrice ||
                                item.product.originalPrice) * item.quantity,
                            )}
                            <span className={styles.dong}>đ</span>
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                      <div>TỔNG TIỀN: </div>
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
