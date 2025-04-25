import {
  LoginOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  BellOutlined,
} from "@ant-design/icons";
import {
  faCartShopping,
  faFire,
  faMagnifyingGlass,
  faUser,
  faUserAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState, useCallback } from "react";
import "tippy.js/dist/tippy.css";
import { getAllCategories } from "../../../../services/api/categoryService";
import { getProductList } from "../../../../services/api/productService";
import styles from "./Header.module.scss";
import { Link, useNavigate } from "react-router-dom";
import {
  message,
  notification,
  Dropdown,
  Badge,
  Button,
  Typography,
  Space,
} from "antd";
import { logOut } from "../../../../services/api/authService";
import {
  getNotifications,
  markNotificationAsRead,
} from "../../../../services/api/notifications";
import io from "socket.io-client";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

const { Text } = Typography;

const removeVietnameseTones = (str) => {
  str = str.toLowerCase();
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  str = str.replace(/đ/g, "d").replace(/Đ/g, "D");
  return str;
};

const categoryImages = {
  Nhẫn: "https://bizweb.dktcdn.net/100/461/213/themes/870653/assets/mega-4-image-2.jpg?1744711547396",
  "Vòng tay":
    "https://bizweb.dktcdn.net/100/461/213/themes/870653/assets/mega-3-image-2.jpg?1744711547396",
  "Hoa Tai":
    "https://bizweb.dktcdn.net/100/461/213/themes/870653/assets/mega-2-image-2.jpg?1744711547396",
  "Dây chuyền":
    "https://bizweb.dktcdn.net/100/461/213/themes/870653/assets/mega-1-image-2.jpg?1744711547396",
};

function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page] = useState(1);
  const limit = 100;
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");
  const isVerified = localStorage.getItem("isVerified") === "true";
  const [cartItems, setCartItems] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationPage, setNotificationPage] = useState(1);
  const notificationLimit = 10;

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart);
    setCartCount(cart.length);
  }, []);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const result = await getProductList(page, limit);
        if (result.data) {
          setAllProducts(result.data);
          setFilteredProducts(result.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchAllProducts();
  }, [page, limit]);

  useEffect(() => {
    const search = () => {
      if (!keyword.trim()) {
        setFilteredProducts(allProducts);
        return;
      }

      const searchTerms = removeVietnameseTones(keyword)
        .split(/\s+/)
        .filter((term) => term);

      const filtered = allProducts.filter((product) => {
        const productName = removeVietnameseTones(product.name);
        return searchTerms.every((term) => productName.includes(term));
      });

      setFilteredProducts(filtered);
    };

    const debounceTimeout = setTimeout(search, 300);
    return () => clearTimeout(debounceTimeout);
  }, [keyword, allProducts]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await getAllCategories();
        if (response) {
          setMenuItems(response);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchMenuItems();
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await getNotifications(
        notificationPage,
        0,
        "INVOICE_UPDATE",
      );
      setNotifications(response.notifications || []);
      setUnreadNotifications(response.unreadCount || 0);
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải danh sách thông báo.",
        icon: "error",
      });
    }
  }, [notificationPage]);

  useEffect(() => {
    if (accessToken) {
      fetchNotifications();

      // Kết nối WebSocket
      const socket = io("http://35.247.185.8", {
        auth: { token: `Bearer ${accessToken}` },
      });

      socket.on("connect", () => {
        console.log("Connected to WebSocket");
      });

      socket.on("notification", (data) => {
        if (data.type === "INVOICE_UPDATE" && data.source === "ADMIN") {
          toast.info(data.message, { autoClose: 3000 });
          setNotifications((prev) => [
            {
              id: data.notificationId,
              message: data.message,
              type: data.type,
              source: data.source,
              isRead: false,
              createdAt: data.createdAt || new Date().toISOString(),
            },
            ...prev,
          ]);
          setUnreadNotifications((prev) => prev + 1);
        }
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from WebSocket");
      });

      return () => socket.disconnect();
    }
  }, [fetchNotifications, accessToken]);

  // Đánh dấu thông báo đã đọc
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );
      setUnreadNotifications((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể đánh dấu thông báo đã đọc.",
        icon: "error",
      });
    }
  };

  const handleSaleClick = () => {
    navigate("/list-product", {
      state: { isCategory: false, isSale: true },
      replace: true,
    });
  };

  const handleInputChange = (value) => {
    setKeyword(value);
  };

  const handleSearch = () => {
    if (keyword.trim()) {
      setShowSuggestions(false);
      navigate(`/list-product?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleCart = () => navigate("/cart/gio-hang-cua-ban");

  const handleCategoryClick = (categoryId) => {
    navigate("/list-product", {
      state: { isCategory: true, categoryId },
      replace: true,
    });
  };

  const handleProductClick = (productName) => {
    setShowSuggestions(false);
    navigate(`/list-product?keyword=${encodeURIComponent(productName)}`);
  };

  const handleLogout = async () => {
    const result = await logOut();
    if (!result.error) {
      localStorage.clear();
      notification.success({
        message: "Thông báo",
        description: "Đăng xuất thành công",
        duration: 3,
      });
      navigate("/");
    } else {
      notification.error({
        message: "Thông báo",
        description: "Đăng xuất thất bại",
        duration: 3,
      });
      console.error("Logout failed:", result.error);
    }
  };

  // Nội dung của Dropdown thông báo
  const notificationMenu = (
    <div className={styles.notificationDropdown}>
      <div className={styles.notificationHeader}>
        <Text strong style={{ fontSize: "16px", color: "black" }}>
          Thông báo
        </Text>
      </div>
      <div className={styles.notificationList}>
        {notifications.length > 0 ? (
          <AnimatePresence>
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                className={styles.notificationItemContent}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text strong className={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                  <Text type="secondary" className={styles.notificationTime}>
                    {new Date(notification.createdAt).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </Text>
                  <Space>
                    <Button
                      type={notification.isRead ? "default" : "primary"}
                      size="small"
                      disabled
                      className={
                        notification.isRead
                          ? styles.readButton
                          : styles.unreadButton
                      }
                    >
                      {notification.isRead ? "Đã đọc" : "Chưa đọc"}
                    </Button>
                    {!notification.isRead && (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className={styles.markAsReadButton}
                      >
                        Đánh dấu đã đọc
                      </Button>
                    )}
                  </Space>
                </Space>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <Text className={styles.noNotification}>Không có thông báo nào</Text>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.wrapper}>
      <Link to="/" className={styles.logo}>
        <img
          width="230"
          height="50"
          src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/logo.png"
          alt="Caraluna"
        />
      </Link>

      <div className={styles.center}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: "20px",
          }}
        >
          <div className={styles.search}>
            <input
              className={styles.input}
              placeholder="Tìm sản phẩm..."
              value={keyword}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            <FontAwesomeIcon
              className={styles.iconGlass}
              icon={faMagnifyingGlass}
              onClick={handleSearch}
              style={{ cursor: "pointer" }}
            />
            {showSuggestions && filteredProducts.length > 0 && (
              <div className={styles.suggestions}>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={styles.suggestionItem}
                    onClick={() => handleProductClick(product.name)}
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className={styles.suggestionImage}
                    />
                    <span>{product.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={styles.noticeWrapper}>
            {accessToken && !isVerified ? (
              <div className={styles.verificationNotice}>
                <span>Tài khoản của bạn chưa được xác minh! </span>
              </div>
            ) : (
              <div className={styles.verificationNotice}></div>
            )}
          </div>
        </div>

        <div className={styles.menu}>
          <ul>
            <li
              onClick={handleSaleClick}
              style={{ cursor: "pointer", fontWeight: "600" }}
            >
              SALE
              <FontAwesomeIcon className={styles.iconFire} icon={faFire} />
            </li>
            {menuItems.map((item) => (
              <li key={item.id}>
                <div style={{ fontWeight: "600", fontSize: "16px" }}>
                  {item.name.toUpperCase()}
                </div>
                <div className={styles.submenu}>
                  <div className={styles.menu1}>
                    {item.children && item.children.length > 0 ? (
                      <ul className={styles.ul1}>
                        <div className={styles.li1}>
                          <li className={styles.headerli}>Danh mục</li>
                          <div className={styles.subcategories}>
                            {item.children.map((sub) => (
                              <li
                                key={sub.id}
                                onClick={() => handleCategoryClick(sub.id)}
                                style={{ cursor: "pointer" }}
                              >
                                {sub.name}
                              </li>
                            ))}
                          </div>
                        </div>
                      </ul>
                    ) : (
                      <p>Không có danh mục con</p>
                    )}
                    <div className={styles.imageContainer}>
                      <img
                        src={
                          categoryImages[item.name] ||
                          "https://bizweb.dktcdn.net/100/461/213/themes/870653/assets/mega-1-image-2.jpg"
                        }
                        alt={`Ảnh ${item.name}`}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.right}>
        <div
          className={styles.account}
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <div className={styles.circle}>
            <FontAwesomeIcon className={styles.iconUser} icon={faUserAlt} />
          </div>
          {showDropdown && (
            <div className={styles.dropdownMenu}>
              {accessToken ? (
                <div style={{ zIndex: "10" }}>
                  <div
                    onClick={() => navigate("/account")}
                    className={styles.dropdownItem}
                  >
                    <FontAwesomeIcon
                      icon={faUser}
                      style={{ marginRight: "12px" }}
                    />
                    <span>Tài khoản</span>
                  </div>
                  <div
                    className={styles.dropdownItem}
                    onClick={handleLogout}
                    style={{ cursor: "pointer" }}
                  >
                    <LogoutOutlined style={{ marginRight: "10px" }} />
                    Đăng xuất
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/login" className={styles.dropdownItem}>
                    <LoginOutlined
                      style={{ marginRight: "10px", color: "black" }}
                    />
                    <span style={{ color: "black" }}>Đăng nhập</span>
                  </Link>
                  <Link to="/register" className={styles.dropdownItem}>
                    <LogoutOutlined
                      style={{ marginRight: "27px", color: "black" }}
                    />
                    <span style={{ color: "black" }}>Đăng ký</span>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {accessToken && (
          <div className={styles.notification}>
            <Dropdown
              overlay={notificationMenu}
              trigger={["click"]}
              placement="bottomRight"
              overlayStyle={{
                background: "#fff",
                padding: " 10px  ",
                borderRadius: "10px",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
              }}
              className={styles.customNotification}
              overlayClassName={styles.customNotificationDropdown} // Thêm class tùy chỉnh cho container ngoài
            >
              <div className={styles.circle}>
                <Badge count={unreadNotifications} size="small" offset={[5, 0]}>
                  <BellOutlined style={{ fontSize: "20px" }} />
                </Badge>
              </div>
            </Dropdown>
          </div>
        )}

        <div
          className={styles.box}
          onMouseEnter={() => setShowCartDropdown(true)}
          onMouseLeave={() => setShowCartDropdown(false)}
        >
          <div className={styles.circle} onClick={handleCart}>
            <FontAwesomeIcon
              className={styles.iconCart}
              icon={faCartShopping}
            />
            {cartCount > 0 && (
              <span className={styles.cartCount}>{cartCount}</span>
            )}
          </div>
          {showCartDropdown && (
            <div className={styles.cartDropdownMenu}>
              {cartItems.length > 0
                ? cartItems.map((item, index) => (
                    <div key={index} className={styles.cartItem}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className={styles.cartItemImage}
                      />
                      <div className={styles.cartItemDetails}>
                        <div className={styles.cartItemName}>{item.name}</div>
                        <div className={styles.cartItemPrice}>{item.price}</div>
                        <div className={styles.cartItemQuantity}>
                          Số lượng: {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))
                : null}
              <div className={styles.dropDownMenuCart}>
                <ShoppingCartOutlined
                  style={{
                    marginRight: "10px",
                    marginTop: "5px",
                    color: "black",
                  }}
                />
                <Link to="/cart/gio-hang-cua-ban" className={styles.menuCart}>
                  <span style={{ color: "black" }}>Xem giỏ hàng</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
