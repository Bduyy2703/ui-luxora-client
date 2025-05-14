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
import logo from "../../../../assets/icon/LogoWeb.jpg";
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
  Typography,
  Space,
  Tag,
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

import "react-toastify/dist/ReactToastify.css";

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
  const [hasInteracted, setHasInteracted] = useState(false);

  const notificationSound = new Audio("/assets/sounds/notificationFinal.mp3");

  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("keydown", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, []);

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
      // console.log();
    }
  }, [notificationPage]);

  useEffect(() => {
    if (accessToken) {
      fetchNotifications();

      if (window.Notification) {
        if (Notification.permission === "default") {
          Notification.requestPermission().then((permission) => {
            if (permission === "denied") {
              Swal.fire({
                title: "Thông báo bị chặn",
                text: "Vui lòng bật quyền thông báo trong cài đặt trình duyệt để nhận thông báo.",
                icon: "warning",
              });
            }
          });
        } else if (Notification.permission === "denied") {
          console.warn("Notification permission is denied.");
          Swal.fire({
            title: "Thông báo bị chặn",
            text: "Vui lòng bật quyền thông báo trong cài đặt trình duyệt.",
            icon: "warning",
          });
        }
      }

      const socket = io("https://dclux.store", {
        auth: { token: `Bearer ${accessToken}` },
      });

      socket.on("connect", () => {});

      socket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error.message);
      });

      socket.on("notification", (data) => {
        const notificationType = data.type?.trim();
        const notificationSource = data.source?.trim();

        if (
          notificationType === "INVOICE_UPDATE" &&
          notificationSource === "ADMIN"
        ) {
          toast.info(
            <div>
              <strong>Thông báo mới!</strong>
              <p>{data.message}</p>
              <button
                style={{
                  background: "#d4af37",
                  color: "#fff",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/account/orders")}
              >
                Xem chi tiết
              </button>
            </div>,
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              className: styles.customToast,
            },
          );

          if (window.Notification && Notification.permission === "granted") {
            const systemNotification = new Notification("Thông báo mới!", {
              body: data.message,
              icon: "/assets/icon/bell.png",
              tag: data.notificationId,
            });

            systemNotification.onclick = () => {
              window.focus();
              navigate("/account/orders");
            };
          }

          if (hasInteracted) {
            notificationSound.play().catch((error) => {
              console.error("Error playing notification sound:", error.message);
              toast.error(
                "Không thể phát âm thanh thông báo. Vui lòng kiểm tra tệp âm thanh hoặc cài đặt trình duyệt.",
                {
                  position: "top-right",
                  autoClose: 5000,
                },
              );
            });
          } else {
            toast.info("Vui lòng nhấp vào trang để bật âm thanh thông báo.", {
              position: "top-right",
              autoClose: 5000,
            });
          }

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

      socket.on("disconnect", () => {});

      return () => {
        socket.disconnect();
      };
    }
  }, [accessToken, fetchNotifications, navigate, hasInteracted]);

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

  const notificationMenu = (
    <div className="notification-dropdown" style={{ padding: "0px" }}>
      <div className={styles.notificationHeader}>
        <Text
          strong
          style={{
            fontSize: "16px",
            color: "#2b2b2b",
            padding: "5px 0px 8px 10px",
            display: "flex",
            width: "100%",
          }}
        >
          Thông báo
        </Text>
      </div>
      <div className="notification-list">
        {notifications.length > 0 ? (
          <AnimatePresence>
            {notifications.map((notification, index) => (
              <motion.div
                onClick={() =>
                  !notification.isRead && handleMarkAsRead(notification.id)
                }
                style={{ borderTop: "1px solid #e8e8e8" }}
                key={notification.id}
                className="notification-item-contentt"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Space
                  align="start"
                  style={{ width: "100%", padding: "10px 10px 10px 10px" }}
                  className={styles.spaceNoti}
                >
                  <BellOutlined
                    style={{
                      fontSize: "16px",
                      color: "#d4af37",
                      marginTop: "4px",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div className={styles.notificationMessageWrapper}>
                      <div>
                        <Text className={styles.notificationMessage}>
                          {notification.message}
                        </Text>
                      </div>
                      <Text
                        type="secondary"
                        className={styles.notificationTime}
                      >
                        {new Date(notification.createdAt).toLocaleString(
                          "vi-VN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          },
                        )}
                      </Text>
                    </div>
                    <Space style={{ marginTop: "4px" }}>
                      <Tag
                        color={notification.isRead ? "default" : "gold"}
                        className={
                          notification.isRead
                            ? styles.readTag
                            : styles.unreadTag
                        }
                      >
                        <span>
                          {notification.isRead ? "Đã đọc" : "Chưa đọc"}
                        </span>
                      </Tag>
                    </Space>
                  </div>
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
          style={{ width: "170px", height: "90px" }}
          src={logo}
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
                                style={{
                                  cursor: "pointer",
                                  color: "#333",
                                  fontWeight: "400",
                                }}
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
                padding: "0px 0px 0px 0px",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                zIndex: 1000,
              }}
              className={styles.customNotification}
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
