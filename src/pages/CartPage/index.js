import React, { useState, useEffect, useMemo, useCallback } from "react";
import { debounce } from "lodash";
import styles from "./CartPage.module.scss";
import cartEmptyImage from "../../assets/icon/cart-empty.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import { fetchDiscounts } from "../../services/api/discountService";
import { fetchPayment } from "../../services/api/checkoutService";
import {
  getCart,
  updateCartItem,
  deleteCartItem,
  deleteCart,
  checkOutProduct,
} from "../../services/api/cartService";
import { getByIdProduct } from "../../services/api/productService";
import { Modal, notification, Tooltip } from "antd";
import placeholderImage from "../../assets/images/daychuyen1/vyn13-t-1-1659674319051.webp";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentItemKey, setCurrentItemKey] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState({});
  const [productDetailsMap, setProductDetailsMap] = useState({});
  const [isLoadingCart, setIsLoadingCart] = useState(false);
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

  // Lấy dữ liệu giỏ hàng
  useEffect(() => {
    const fetchCartItems = async () => {
      setIsLoadingCart(true);
      let retries = 2;
      while (retries >= 0) {
        try {
          const response = await getCart();
          if (response && Array.isArray(response.cartItems)) {
            const filteredItems = selectedProductDetailsId
              ? response.cartItems.filter(
                  (item) => item.productDetails.id === selectedProductDetailsId,
                )
              : response.cartItems;
            setCartItems(filteredItems);
            break;
          } else {
            setCartItems([]);
          }
        } catch (error) {
          retries--;
          if (retries < 0) {
            console.error("Lỗi khi lấy dữ liệu giỏ hàng:", error);
            notification.error({
              message: "Thông báo",
              description: "Không thể tải dữ liệu giỏ hàng, vui lòng thử lại",
              duration: 3,
            });
            setCartItems([]);
          }
        }
      }
      setIsLoadingCart(false);
    };

    fetchCartItems();
  }, [selectedProductDetailsId]);

  // Lấy chi tiết sản phẩm
  useEffect(() => {
    const fetchProductDetails = async () => {
      const uniqueProductIds = [
        ...new Set(cartItems.map((item) => item.productDetails.product.id)),
      ].filter((productId) => !productDetailsMap[productId]);

      if (uniqueProductIds.length === 0) return;

      try {
        const productPromises = uniqueProductIds.map(async (productId) => {
          const productData = await getByIdProduct(productId);
          return { productId, productData };
        });

        const productResults = (await Promise.all(productPromises)).filter(
          (result) => result !== null,
        );

        setProductDetailsMap((prev) => ({
          ...prev,
          ...productResults.reduce((acc, { productId, productData }) => {
            acc[productId] = productData;
            return acc;
          }, {}),
        }));
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
        notification.error({
          message: "Thông báo",
          description: "Không thể tải chi tiết sản phẩm, vui lòng thử lại",
          duration: 3,
        });
      }
    };

    if (cartItems.length > 0) {
      fetchProductDetails();
    }
  }, [cartItems]);

  const getItemKey = useCallback(
    (item) =>
      `${item.id}-${item.productDetails.color}-${item.productDetails.size}`,
    [],
  );

  const handleSelectItem = useCallback((itemKey) => {
    setSelectedItems((prev) =>
      prev.includes(itemKey)
        ? prev.filter((key) => key !== itemKey)
        : [...prev, itemKey],
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => getItemKey(item)));
    }
  }, [cartItems, selectedItems, getItemKey]);

  const debouncedUpdateCartItem = useMemo(
    () =>
      debounce(async (cartItemId, quantity, callback) => {
        try {
          await updateCartItem(cartItemId, quantity);
          const response = await getCart();
          callback(response.cartItems || []);
        } catch (error) {
          notification.error({
            message: "Thông báo",
            description: "Cập nhật số lượng thất bại, vui lòng thử lại",
            duration: 3,
          });
        }
      }, 300),
    [],
  );

  // Hủy debounce khi unmount
  useEffect(() => {
    return () => {
      debouncedUpdateCartItem.cancel();
    };
  }, [debouncedUpdateCartItem]);

  const handleIncrement = useCallback(
    (itemKey) => {
      const item = cartItems.find((i) => getItemKey(i) === itemKey);
      if (!item) return;

      const newQuantity = item.quantity + 1;

      if (newQuantity > item.productDetails.stock) {
        notification.error({
          message: "Thông báo",
          description: `Số lượng tồn kho chỉ còn ${item.productDetails.stock} sản phẩm`,
          duration: 3,
        });
        return;
      }

      setLoadingItems((prev) => ({ ...prev, [itemKey]: true }));
      setCartItems((prev) =>
        prev.map((i) =>
          getItemKey(i) === itemKey ? { ...i, quantity: newQuantity } : i,
        ),
      );

      debouncedUpdateCartItem(item.id, newQuantity, (newCartItems) => {
        setCartItems(newCartItems);
        setLoadingItems((prev) => ({ ...prev, [itemKey]: false }));
      });
    },
    [cartItems, debouncedUpdateCartItem, getItemKey],
  );

  const handleDecrement = useCallback(
    (itemKey) => {
      const item = cartItems.find((i) => getItemKey(i) === itemKey);
      if (!item || item.quantity <= 1) return;

      const newQuantity = item.quantity - 1;

      setLoadingItems((prev) => ({ ...prev, [itemKey]: true }));
      setCartItems((prev) =>
        prev.map((i) =>
          getItemKey(i) === itemKey ? { ...i, quantity: newQuantity } : i,
        ),
      );

      debouncedUpdateCartItem(item.id, newQuantity, (newCartItems) => {
        setCartItems(newCartItems);
        setLoadingItems((prev) => ({ ...prev, [itemKey]: false }));
      });
    },
    [cartItems, debouncedUpdateCartItem, getItemKey],
  );

  const showDeleteConfirm = useCallback((itemKey) => {
    setCurrentItemKey(itemKey);
    setIsModalVisible(true);
  }, []);

  const handleRemoveItem = useCallback(async () => {
    const item = cartItems.find((i) => getItemKey(i) === currentItemKey);
    if (!item) return;

    try {
      await deleteCartItem(item.id);
      const response = await getCart();
      setCartItems(response.cartItems || []);
      notification.success({
        message: "Thông báo",
        description: "Xóa sản phẩm thành công",
        duration: 3,
      });
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      notification.error({
        message: "Thông báo",
        description: "Xóa sản phẩm thất bại, vui lòng thử lại",
        duration: 3,
      });
    }
    setIsModalVisible(false);
  }, [cartItems, currentItemKey, getItemKey]);

  const handleClearCart = useCallback(() => {
    Modal.confirm({
      title: "Xác nhận xóa toàn bộ giỏ hàng",
      content: "Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteCart();
          setCartItems([]);
          notification.success({
            message: "Thông báo",
            description: "Xóa toàn bộ giỏ hàng thành công",
            duration: 3,
          });
        } catch (error) {
          console.error("Lỗi khi xóa giỏ hàng:", error);
          notification.error({
            message: "Thông báo",
            description: "Xóa giỏ hàng thất bại, vui lòng thử lại",
            duration: 3,
          });
        }
      },
    });
  }, []);

  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const groupedItems = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const productId = item.productDetails.product.id;
      if (!acc[productId]) {
        acc[productId] = [];
      }
      acc[productId].push(item);
      return acc;
    }, {});
  }, [cartItems]);

  const totalAmount = useMemo(
    () =>
      cartItems.reduce((total, item) => {
        if (!selectedItems.includes(getItemKey(item))) return total;
        const productData = productDetailsMap[item.productDetails.product.id];
        const price = parseFloat(
          productData?.finalPrice || item.productDetails.product.finalPrice,
        );
        return total + price * item.quantity;
      }, 0),
    [cartItems, productDetailsMap, selectedItems, getItemKey],
  );

  const [paymentData, setPaymentData] = useState([]);
  const [discount_id, setDiscount_id] = useState(null);

  localStorage.setItem("discount_id", discount_id);

  const handleCheckout = useCallback(async () => {
    if (selectedItems.length === 0) {
      notification.error({
        message: "Thông báo",
        description: "Vui lòng chọn ít nhất một sản phẩm để thanh toán",
        duration: 3,
      });
      return;
    }

    console.log("cartItems", cartItems);

    try {
      const selectedItemsData = cartItems
        .filter((item) => selectedItems.includes(getItemKey(item)))
        .map((item) => ({
          productId: item.productDetails.id,
          quantity: item.quantity,
        }));

      const response = await checkOutProduct({
        selectedItems: selectedItemsData,
      });

      if (response.error) {
        console.error("Lỗi khi lấy dữ liệu thanh toán:", response.error);
        notification.error({
          message: "Thông báo",
          description: "Lỗi khi xử lý thanh toán, vui lòng thử lại",
          duration: 3,
        });
        return;
      }
      setPaymentData(response);

      navigate("/checkout", {
        state: {
          cartItems: cartItems.filter((item) =>
            selectedItems.includes(getItemKey(item)),
          ),
          emailtoken: localStorage.getItem("userEmail"),
          paymentData: response,
        },
      });
    } catch (error) {
      console.error("Lỗi không mong muốn:", error);
      notification.error({
        message: "Thông báo",
        description: "Lỗi không mong muốn, vui lòng thử lại",
        duration: 3,
      });
    }
  }, [cartItems, selectedItems, navigate, getItemKey]);

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className={styles.wrapper}>
        <span className={styles.nameCart}>Giỏ hàng của bạn</span>
        <div className={styles.cart}>
          <div className={styles.cartLeft}>
            {isLoadingCart ? (
              <div className={styles.skeleton}>
                {[...Array(2)].map((_, index) => (
                  <div key={index} className={styles.skeletonItem}>
                    <div className={styles.skeletonImage} />
                    <div>
                      <div className={styles.skeletonText} />
                      <div className={styles.skeletonText} />
                    </div>
                    <div className={styles.skeletonPrice} />
                    <div className={styles.skeletonQuantity}>
                      <div className={styles.skeletonButton} />
                      <div
                        className={styles.skeletonText}
                        style={{ width: "50px" }}
                      />
                      <div className={styles.skeletonButton} />
                    </div>
                    <div className={styles.skeletonPrice} />
                  </div>
                ))}
              </div>
            ) : cartItems.length === 0 ? (
              <div style={{ textAlign: "center" }}>
                <div>
                  <img
                    className={styles.img}
                    src={cartEmptyImage}
                    alt="Giỏ hàng trống"
                  />
                </div>
                <div
                  className={styles.empty}
                  style={{
                    color: "#3d3d3d",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  Không có sản phẩm nào trong giỏ hàng của bạn
                </div>
              </div>
            ) : (
              <>
                <div className={styles.tableHeader}>
                  <div className={styles.headerItem}>
                    <label className={styles.checkboxWrapper}>
                      <input
                        type="checkbox"
                        checked={selectedItems.length === cartItems.length}
                        onChange={handleSelectAll}
                        aria-label="Chọn tất cả sản phẩm"
                      />
                      <span className={styles.customCheckbox}></span>
                    </label>
                  </div>
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
                              productDetailsMap[
                                firstItem.productDetails.product.id
                              ]?.images?.[0]?.fileUrl || placeholderImage
                            }
                            alt={
                              firstItem.productDetails.product.name ||
                              "Sản phẩm"
                            }
                            onError={(e) => {
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
                        const productData =
                          productDetailsMap[item.productDetails.product.id];
                        return (
                          <div key={itemKey} className={styles.variantRow}>
                            <div className={styles.checkboxColumn}>
                              <label className={styles.checkboxWrapper}>
                                <input
                                  type="checkbox"
                                  checked={selectedItems.includes(itemKey)}
                                  onChange={() => handleSelectItem(itemKey)}
                                  aria-label={`Chọn sản phẩm ${item.productDetails.color} - ${item.productDetails.size}`}
                                />
                                <span className={styles.customCheckbox}></span>
                              </label>
                            </div>
                            <div className={styles.variantInfo}>
                              <span className={styles.variantText}>
                                {item.productDetails.color} -{" "}
                                {item.productDetails.size}
                              </span>
                              <a
                                title="Xóa sản phẩm"
                                className={styles.removeBtn}
                                onClick={() => showDeleteConfirm(itemKey)}
                              >
                                <span className={styles.removeIcon}>🗑️</span>{" "}
                                Xóa
                              </a>
                            </div>
                            <div className={styles.price}>
                              {new Intl.NumberFormat("vi-VN").format(
                                parseFloat(
                                  productData?.finalPrice ||
                                    item.productDetails.product.finalPrice,
                                ),
                              )}
                              <span className={styles.dong}>đ</span>
                            </div>
                            <div className={styles.quantityControl}>
                              <button
                                className={styles.quantityButton}
                                onClick={() => handleDecrement(itemKey)}
                                disabled={
                                  loadingItems[itemKey] || item.quantity <= 1
                                }
                              >
                                -
                              </button>
                              <span className={styles.quantity}>
                                {item.quantity} / {item.productDetails.stock}
                              </span>
                              <button
                                className={styles.quantityButton}
                                onClick={() => handleIncrement(itemKey)}
                                disabled={
                                  loadingItems[itemKey] ||
                                  item.quantity >= item.productDetails.stock
                                }
                              >
                                +
                              </button>
                            </div>
                            <div className={styles.price}>
                              {new Intl.NumberFormat("vi-VN").format(
                                parseFloat(
                                  productData?.finalPrice ||
                                    item.productDetails.product.finalPrice,
                                ) * item.quantity,
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
                  open={isModalVisible}
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
                          <span className={styles.totalMoney}>đ</span>
                        </h4>
                      </div>
                    </div>
                    <button
                      className={styles.btnCheckout}
                      onClick={handleCheckout}
                    >
                      Thanh toán
                    </button>
                    {cartItems.length > 0 && (
                      <button
                        className={styles.btnDeleteAll}
                        onClick={handleClearCart}
                      >
                        Xóa
                      </button>
                    )}
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
