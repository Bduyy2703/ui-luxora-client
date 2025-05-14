import {
  BarChartOutlined,
  LogoutOutlined,
  PercentageOutlined,
  ShoppingOutlined,
  StarOutlined,
  UserOutlined,
  BellOutlined,
} from "@ant-design/icons";
import {
  Menu,
  notification,
  Dropdown,
  Button,
  Badge,
  Typography,
  Space,
} from "antd";
import { IconBrandDribbble } from "@tabler/icons-react";
import { useEffect, useState, useCallback, useRef } from "react";
// import logoTest from "../../assets/icon/te.png";
import logoTest from "../../../assets/icon/LogoWeb.jpg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logOut } from "../../../services/api/authService";
import {
  getAllNotifications,
  markNotificationAsReadAdmin,
} from "../../../services/api/notifications";
import io from "socket.io-client";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import "./sidebar.css";

const { Text } = Typography;

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lastPathSegment = location.pathname.split("/").pop();

  const [selectedKeys, setSelectedKeys] = useState([lastPathSegment]);
  const [openKeys, setOpenKeys] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const prevNotificationsRef = useRef([]);

  const token = localStorage.getItem("accessToken") || "your-jwt-token";
  const API_BASE_URL = "https://dclux.store/";

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

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await getAllNotifications(1, 0, "");
      return response;
    } catch (error) {
      // console.log();
    }
  }, []);

  const handleNewNotification = (data) => {
    toast.info(
      <div>
        <strong>Thông báo mới!</strong>
        <p>{data.message}</p>
        <button
          style={{
            background: "#1890ff",
            color: "#fff",
            border: "none",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/admin/invoice")}
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
      },
    );

    if (window.Notification && Notification.permission === "granted") {
      try {
        const systemNotification = new Notification("Thông báo mới!", {
          body: data.message,
          icon: "/assets/icon/bell.png",
          tag: data.notificationId || "default-tag",
        });

        systemNotification.onclick = () => {
          window.focus();
          navigate("/admin/invoice");
        };

        systemNotification.onerror = (error) => {
          console.error("System notification error:", error);
        };
      } catch (error) {
        console.error("Failed to create system notification:", error);
        toast.error(
          "Không thể hiển thị thông báo hệ thống. Vui lòng kiểm tra cài đặt thông báo trên Windows và trình duyệt.",
          {
            position: "top-right",
            autoClose: 5000,
          },
        );
      }
    } else {
      console.warn(
        "Cannot show notification: Permission not granted or Notification API not supported.",
      );
      if (Notification.permission !== "granted") {
        toast.warn(
          "Quyền thông báo chưa được cấp. Vui lòng bật quyền thông báo trong cài đặt trình duyệt.",
          {
            position: "top-right",
            autoClose: 5000,
          },
        );
      }
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
  };

  useEffect(() => {
    fetchNotifications().then((response) => {
      if (response) {
        setNotifications(response.notifications || []);
        setUnreadCount(response.unreadCount || 0);
        prevNotificationsRef.current = response.notifications || [];
      }
    });

    const interval = setInterval(async () => {
      const response = await fetchNotifications();
      if (response) {
        const newNotifications = response.notifications || [];
        const newUnreadCount = response.unreadCount || 0;

        const currentIds = prevNotificationsRef.current.map((n) => n.id);
        const newItems = newNotifications.filter(
          (n) => !currentIds.includes(n.id),
        );

        newItems.forEach((item) => {
          const notificationType = item.type?.trim();
          const notificationSource = item.source?.trim();

          if (
            (notificationType === "INVOICE_CREATED" ||
              notificationType === "INVOICE_CANCELLED" ||
              notificationType === "INVOICE_PAYMENT") &&
            notificationSource === "USER"
          ) {
            handleNewNotification(item);
          }
        });

        setNotifications(newNotifications);
        setUnreadCount(newUnreadCount);
        prevNotificationsRef.current = newNotifications;
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchNotifications, hasInteracted, navigate]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsReadAdmin(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      prevNotificationsRef.current = prevNotificationsRef.current.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n,
      );
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể đánh dấu thông báo đã đọc.",
        icon: "error",
      });
    }
  };

  useEffect(() => {
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
      } else {
      }
    } else {
      console.error("Notification API is not supported in this browser.");
    }

    const socket = io(API_BASE_URL, {
      auth: { token: `Bearer ${token}` },
    });

    socket.on("connect", () => {});

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error.message);
    });

    socket.on("notification", (data) => {
      const notificationType = data.type?.trim();
      const notificationSource = data.source?.trim();

      if (
        (notificationType === "INVOICE_CREATED" ||
          notificationType === "INVOICE_CANCELLED" ||
          notificationType === "INVOICE_PAYMENT") &&
        notificationSource === "USER"
      ) {
        handleNewNotification(data);

        setNotifications((prev) => {
          const updatedNotifications = [
            {
              id: data.notificationId || `temp-id-${Date.now()}`,
              message: data.message,
              type: data.type || "UNKNOWN",
              source: data.source || "UNKNOWN",
              isRead: false,
              createdAt: data.createdAt || new Date().toISOString(),
            },
            ...prev,
          ];
          prevNotificationsRef.current = updatedNotifications;
          return updatedNotifications;
        });
        setUnreadCount((prev) => prev + 1);
      } else {
      }
    });

    socket.on("disconnect", () => {});

    return () => {
      socket.disconnect();
    };
  }, [token, navigate, hasInteracted]);

  useEffect(() => {
    setSelectedKeys([lastPathSegment]);
    const parentKey = items.find((item) =>
      item.children?.some((child) => child.key === lastPathSegment),
    )?.key;
    if (parentKey && !openKeys.includes(parentKey)) {
      setOpenKeys([parentKey]);
    }
  }, [lastPathSegment]);

  const handleMenuSelect = ({ key }) => {
    setSelectedKeys([key]);
  };

  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const handleLogout = async () => {
    try {
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
    } catch (error) {
      notification.error({
        message: "Thông báo",
        description: "Đã có lỗi xảy ra khi đăng xuất",
        duration: 3,
      });
      console.error("Logout error:", error);
    }
  };

  const notificationMenu = (
    <div className="notification-dropdown">
      <div>
        <Text
          strong
          style={{
            fontSize: "16px",
            color: "#333",
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
                key={notification.id}
                className="notification-item-content"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() =>
                  !notification.isRead && handleMarkAsRead(notification.id)
                }
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text strong>{notification.message}</Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
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
                      style={{
                        backgroundColor: notification.isRead
                          ? "#f5f5f5"
                          : "#e6f7ff",
                        borderColor: notification.isRead
                          ? "#d9d9d9"
                          : "#91d5ff",
                        color: notification.isRead ? "#000" : "#1890ff",
                      }}
                    >
                      {notification.isRead ? "Đã đọc" : "Chưa đọc"}
                    </Button>
                  </Space>
                </Space>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <Text style={{ padding: "16px", display: "block" }}>
            Không có thông báo nào
          </Text>
        )}
      </div>
    </div>
  );

  const items = [
    {
      key: "user",
      icon: <UserOutlined />,
      label: "Quản lý người dùng",
      children: [
        {
          key: "user",
          label: <Link to="/admin/user">Danh sách người dùng</Link>,
        },
      ],
    },
    {
      key: "products",
      icon: <ShoppingOutlined />,
      label: "Quản lý sản phẩm",
      children: [
        {
          key: "product",
          label: <Link to="/admin/product">Sản phẩm</Link>,
        },
        {
          key: "cate",
          label: <Link to="/admin/cate">Danh mục</Link>,
        },
        {
          key: "invoice",
          label: <Link to="/admin/invoice">Hóa đơn</Link>,
        },
        {
          key: "inventory",
          label: <Link to="/admin/inventory">Chi nhánh</Link>,
        },
      ],
    },
    {
      key: "discount",
      icon: <PercentageOutlined />,
      label: "Quản lý giảm giá",
      children: [
        {
          key: "discount",
          label: <Link to="/admin/discount">Mã giảm giá</Link>,
        },
        {
          key: "promotion",
          label: <Link to="/admin/promotion">Chương trình khuyến mãi</Link>,
        },
      ],
    },
    {
      key: "reviews",
      icon: <StarOutlined />,
      label: <Link to="/admin/reviews">Đánh giá</Link>,
    },
    {
      key: "statis",
      icon: <BarChartOutlined />,
      label: <Link to="/admin/statis">Thống kê</Link>,
    },
    {
      key: "blog",
      icon: (
        <IconBrandDribbble
          style={{ width: "24px", height: "24px", paddingRight: "9px" }}
        />
      ),
      label: <Link to="/admin/blog">Bài viết</Link>,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="info">
        <div className="logo">
          <img
            width="230"
            height="90"
            // src="/src/assets/icon/testLogo.png"
            src={logoTest}
            alt="Logo"
            style={{ marginBottom: "10px" }}
          />
        </div>
      </div>
      <div className="notification-section">
        <Dropdown
          overlay={notificationMenu}
          trigger={["click"]}
          placement="bottomLeft"
        >
          <div className="notification-item">
            <Badge count={unreadCount} size="small" offset={[5, 0]}>
              <BellOutlined
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  color: "#2b2b2b",
                }}
              />
            </Badge>
          </div>
        </Dropdown>
      </div>
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onSelect={handleMenuSelect}
        onOpenChange={handleOpenChange}
        style={{
          flex: 1,
          borderRight: 0,
          marginTop: "-15px",
        }}
        items={items}
      />
      <div className="logout-section">
        <a href="#" onClick={handleLogout}>
          <LogoutOutlined style={{ marginRight: "8px" }} />
          Đăng xuất
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
