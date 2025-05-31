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
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  message,
  notification,
  Dropdown,
  Badge,
  Typography,
  Space,
  Tag,
  Tabs,
  Select,
} from "antd";
import { logOut } from "../../../../services/api/authService";
import {
  getNotificationsByTypes,
  markNotificationAsRead,
} from "../../../../services/api/notifications";
import io from "socket.io-client";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

import "react-toastify/dist/ReactToastify.css";

const { Text } = Typography;
const { Option } = Select;

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

const getTimeAgo = (createdAt) => {
  const now = new Date();
  const date = new Date(createdAt);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} ngày trước`;
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
  const [notificationTotal, setNotificationTotal] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedInvoiceType, setSelectedInvoiceType] =
    useState("INVOICE_UPDATE");
  const notificationLimit = 10;
  const [hasInteracted, setHasInteracted] = useState(false);
  const { id } = useParams();

  const notificationSound = new Audio("/assets/sounds/notificationFinal.mp3");

  const notificationConfig = {
    INVOICE_UPDATE: {
      route: (item) => `/account/orders/invoice-detail`,
      label: "Đơn hàng",
      color: "blue",
    },
    REVIEW_REPLIED: {
      route: (item) => `/detail-product/${item.productId}`,
      label: "Đánh giá",
      color: "purple",
    },
  };

  const result = notifications.map((item) => {
    const match = item.message.match(/\d+/);
    const id = match ? match[0] : null;

    let invoiceId = null;
    let productId = null;

    if (item.type === "INVOICE_UPDATE") {
      invoiceId = id;
    } else if (item.type === "REVIEW_REPLIED") {
      productId = id;
    }

    return {
      ...item,
      invoiceId,
      productId,
    };
  });

  const notificationsWithRoute = result.map((item) => {
    const config = notificationConfig[item.type] || {
      route: () => "/account",
      label: "Tài khoản",
      color: "default",
    };
    return {
      ...item,
      route: config.route(item),
      label: config.label,
      color: config.color,
    };
  });

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
      let types;
      if (activeTab === "all") {
        types = ["INVOICE_UPDATE", "REVIEW_REPLIED"];
      } else if (activeTab === "invoice") {
        types = [selectedInvoiceType];
      } else {
        types = [];
      }

      const response = await getNotificationsByTypes(
        notificationPage,
        notificationLimit,
        types,
      );

      const notifications = response.notifications || [];
      const filteredNotifications = notifications.filter((notification) =>
        types.includes(notification.type),
      );

      setNotifications(filteredNotifications);
      setUnreadNotifications(response.unreadCount || 0);
      setNotificationTotal(response.total || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  }, [notificationPage, activeTab, selectedInvoiceType]);

  useEffect(() => {
    if (accessToken) {
      fetchNotifications();
    }
  }, [accessToken, fetchNotifications]);

  useEffect(() => {
    if (accessToken) {
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

        if (notificationSource === "ADMIN") {
          const match = data.message.match(/\d+/);
          const id = match ? match[0] : null;
          let invoiceId = null;
          let productId = null;

          if (notificationType === "INVOICE_UPDATE") {
            invoiceId = id;
          } else if (notificationType === "REVIEW_REPLIED") {
            productId = id;
          }

          const newNotification = {
            id: data.notificationId,
            message: data.message,
            type: notificationType,
            source: notificationSource,
            isRead: false,
            createdAt: data.createdAt || new Date().toISOString(),
            invoiceId,
            productId,
          };

          const config = notificationConfig[notificationType] || {
            route: () => "/account",
            label: "Tài khoản",
            color: "default",
          };

          toast.info(
            <div>
              <strong>Thông báo {config.label}!</strong>
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
                onClick={() => navigate(config.route(newNotification))}
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
            const systemNotification = new Notification(
              `Thông báo ${config.label}!`,
              {
                body: data.message,
                icon: "/assets/icon/bell.png",
                tag: data.notificationId,
              },
            );

            systemNotification.onclick = () => {
              window.focus();
              navigate(config.route(newNotification));
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

          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadNotifications((prev) => prev + 1);
          setNotificationTotal((prev) => prev + 1);
        }
      });

      socket.on("disconnect", () => {});

      return () => {
        socket.disconnect();
      };
    }
  }, [accessToken, navigate, hasInteracted]);

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
    navigate(`/list-product?categories=${categoryId}`, {
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
    <div
      className="notification-dropdown"
      style={{ padding: "0px", width: "400px" }}
    >
      <div className={styles.notificationHeader}>
        <Text
          strong
          style={{
            fontSize: "16px",
            color: "#2b2b2b",
            padding: "10px 0px 8px 10px",
            display: "flex",
            width: "100%",
          }}
        >
          Thông báo
        </Text>
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setNotificationPage(1);
          setNotifications([]);
          if (key === "invoice") {
            setSelectedInvoiceType("INVOICE_UPDATE");
          }
        }}
        items={[
          { key: "all", label: "Tất cả" },
          {
            key: "invoice",
            label: "Đơn hàng",
            children: (
              <Select
                value={selectedInvoiceType}
                onChange={(value) => {
                  setSelectedInvoiceType(value);
                  setNotificationPage(1);
                  setNotifications([]);
                }}
                style={{ width: "100%", marginBottom: "10px" }}
              >
                <Option value="INVOICE_UPDATE">Cập nhật hóa đơn</Option>
                <Option value="REVIEW_REPLIED">Phản hồi đánh giá</Option>
              </Select>
            ),
          },
        ]}
        style={{ padding: "0 10px" }}
      />
      <div
        className="notification-list"
        style={{ maxHeight: "280px", overflowY: "auto", paddingBottom: "7px" }}
      >
        {notificationsWithRoute.length > 0 ? (
          <AnimatePresence>
            {notificationsWithRoute.map((notification, index) => (
              <motion.div
                onClick={() => {
                  if (!notification.isRead) handleMarkAsRead(notification.id);
                  navigate(notification.route);
                }}
                style={{ borderTop: "1px solid #e8e8e8", cursor: "pointer" }}
                key={notification.id}
                className="notification-item-contentt"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Space
                  align="start"
                  style={{ width: "100%", padding: "10px" }}
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
                      <Text className={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                      <Text
                        type="secondary"
                        className={styles.notificationTime}
                      >
                        {getTimeAgo(notification.createdAt)}
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
                        {notification.isRead ? "Đã đọc" : "Chưa đọc"}
                      </Tag>
                      <Tag color={notification.color}>{notification.label}</Tag>
                    </Space>
                  </div>
                </Space>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <Text
            style={{ marginLeft: "13px" }}
            className={styles.noNotification}
          >
            Không có thông báo nào
          </Text>
        )}
      </div>
      {notificationTotal > notifications.length && (
        <div style={{ padding: "10px", textAlign: "center" }}>
          <motion.button
            onClick={() => setNotificationPage((prev) => prev + 1)}
            style={{
              background: "#d4af37",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Tải thêm
          </motion.button>
        </div>
      )}
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
              SẢN PHẨM
              <FontAwesomeIcon className={styles.iconFire} icon={faFire} />
            </li>
            {menuItems.map((item) => {
              const subCategories = item.children || [];
              const columns = [[], [], [], []];
              subCategories.forEach((sub, index) => {
                const columnIndex = Math.floor(index / 4);
                if (columnIndex < 4) {
                  columns[columnIndex].push(sub);
                }
              });

              return (
                <li key={item.id}>
                  <div style={{ fontWeight: "600", fontSize: "16px" }}>
                    {item.name.toUpperCase()}
                  </div>
                  <div
                    className={styles.submenu}
                    style={{ marginLeft: accessToken ? "0px" : "-40px" }}
                  >
                    <div className={styles.menu1}>
                      {subCategories.length > 0 ? (
                        <div className={styles.categoryColumns}>
                          {columns.map((column, colIndex) => (
                            <ul
                              key={colIndex}
                              className={styles.categoryColumn}
                            >
                              <li className={styles.headerli}>
                                Danh mục
                                <div className={styles.subcategories}>
                                  {column.map((sub) => (
                                    <li
                                      key={sub.id}
                                      onClick={() =>
                                        handleCategoryClick(sub.id)
                                      }
                                      style={{
                                        cursor: "pointer",
                                        color: "#333",
                                        fontWeight: "400",
                                      }}
                                      className={styles.childCategory}
                                    >
                                      {sub.name}
                                    </li>
                                  ))}
                                </div>
                              </li>
                            </ul>
                          ))}
                        </div>
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
              );
            })}
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
