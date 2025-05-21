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
  Tabs,
  Select,
} from "antd";
import { IconBrandDribbble } from "@tabler/icons-react";
import { useEffect, useState, useCallback, useRef } from "react";
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
import { getUserIdByAdmin } from "../../../services/api/userService";
const { TabPane } = Tabs;
const { Option } = Select;
const { Text } = Typography;

const notificationConfig = {
  INVOICE_CREATED: { route: "/admin/invoice", label: "Hóa đơn", color: "blue" },
  INVOICE_CANCELLED: {
    route: "/admin/invoice",
    label: "Hóa đơn",
    color: "red",
  },
  INVOICE_PAYMENT: {
    route: "/admin/invoice",
    label: "Hóa đơn",
    color: "green",
  },
  REVIEW_UPDATED: {
    route: "/admin/reviews",
    label: "Đánh giá",
    color: "purple",
  },
  REVIEW_DELETED: { route: "/admin/reviews", label: "Đánh giá", color: "red" },
  REVIEW_CREATED: { route: "/admin/reviews", label: "Đánh giá", color: "blue" },
};

const actionMap = {
  REVIEW_UPDATED: "cập nhật đánh giá sản phẩm",
  REVIEW_DELETED: "xóa đánh giá sản phẩm",
  REVIEW_CREATED: "tạo đánh giá sản phẩm",
  INVOICE_CREATED: "đặt đơn hàng",
  INVOICE_PAYMENT: "thanh toán thành công đơn hàng",
  INVOICE_CANCELLED: "hủy đơn hàng",
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

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lastPathSegment = location.pathname.split("/").pop();

  const [selectedKeys, setSelectedKeys] = useState([lastPathSegment]);
  const [openKeys, setOpenKeys] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationTotal, setNotificationTotal] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedInvoiceType, setSelectedInvoiceType] =
    useState("INVOICE_CREATED");
  const [hasInteracted, setHasInteracted] = useState(false);
  const prevNotificationsRef = useRef([]);
  const usersMapRef = useRef({});

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
      let types;
      if (activeTab === "all") {
        types = [
          "INVOICE_CREATED",
          "INVOICE_CANCELLED",
          "INVOICE_GOODS_ISSUED",
          "INVOICE_PAYMENT",
          "INVOICE_DELIVERING",
          "INVOICE_DELIVERED",
          "REVIEW_UPDATED",
          "REVIEW_DELETED",
          "REVIEW_CREATED",
        ];
      } else if (activeTab === "invoice") {
        types = [selectedInvoiceType];
      } else if (activeTab === "review") {
        types = ["REVIEW_UPDATED", "REVIEW_DELETED", "REVIEW_CREATED"];
      } else {
        types = [];
      }

      // Lấy tất cả thông báo, không giới hạn số lượng
      const response = await getAllNotifications(
        1,
        Number.MAX_SAFE_INTEGER,
        types,
      );

      const notifications = response.notifications || [];

      // Lọc phía client để đảm bảo chỉ giữ thông báo khớp với types
      const filteredNotifications = notifications.filter((notification) =>
        types.includes(notification.type),
      );

      // Fetch usernames for unique userIds
      const uniqueUserIds = [
        ...new Set(filteredNotifications.map((n) => n.userId)),
      ];
      const userPromises = uniqueUserIds.map(async (userId) => {
        if (!usersMapRef.current[userId]) {
          try {
            const userData = await getUserIdByAdmin(userId);
            usersMapRef.current[userId] = userData.username || "N/A";
            return { userId, username: userData.username || "N/A" };
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            return { userId, username: "N/A" };
          }
        }
        return { userId, username: usersMapRef.current[userId] };
      });
      const userResults = await Promise.all(userPromises);
      userResults.forEach(({ userId, username }) => {
        usersMapRef.current[userId] = username;
      });

      // Transform notifications
      const updatedNotifications = filteredNotifications.map((notification) => {
        const username = usersMapRef.current[notification.userId] || "N/A";
        let displayMessage;

        if (
          ["REVIEW_UPDATED", "REVIEW_DELETED", "REVIEW_CREATED"].includes(
            notification.type,
          )
        ) {
          displayMessage = `Người dùng ${username} đã ${actionMap[notification.type]}`;
        } else if (
          ["INVOICE_CREATED", "INVOICE_PAYMENT", "INVOICE_CANCELLED"].includes(
            notification.type,
          )
        ) {
          const invoiceIdMatch = notification.message.match(/#(\d+)/) || [];
          const invoiceId = invoiceIdMatch[1] || "N/A";
          const suffix =
            notification.type === "INVOICE_PAYMENT" &&
            notification.message.includes("VNPay")
              ? " qua VNPay"
              : "";
          displayMessage = `Người dùng ${username} đã ${actionMap[notification.type]} #${invoiceId}${suffix}`;
        } else {
          displayMessage = notification.message; // Fallback
        }

        return {
          ...notification,
          displayMessage,
        };
      });

      setNotifications(updatedNotifications);
      setUnreadCount(response.unreadCount || 0);
      setNotificationTotal(response.total || 0);
      prevNotificationsRef.current = updatedNotifications;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  }, [activeTab, selectedInvoiceType]);

  const handleNewNotification = (data) => {
    const config = notificationConfig[data.type] || {
      route: "/admin/invoice",
      label: "Hóa đơn",
      color: "default",
    };

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
          onClick={() => navigate(config.route)}
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
          navigate(config.route);
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
    fetchNotifications();
  }, [fetchNotifications, activeTab, selectedInvoiceType]);

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
          notificationType === "INVOICE_PAYMENT" ||
          notificationType === "REVIEW_UPDATED") &&
        notificationSource === "USER"
      ) {
        // Fetch username for new notification
        const fetchUsername = async () => {
          if (!usersMapRef.current[data.userId]) {
            try {
              const userData = await getUserIdByAdmin(data.userId);
              usersMapRef.current[data.userId] = userData.username || "N/A";
            } catch (error) {
              console.error(`Error fetching user ${data.userId}:`, error);
              usersMapRef.current[data.userId] = "N/A";
            }
          }
          return usersMapRef.current[data.userId];
        };

        fetchUsername().then((username) => {
          let displayMessage = data.message;

          if (notificationType === "REVIEW_UPDATED") {
            displayMessage = `Người dùng ${username} đã ${actionMap[notificationType]}`;
          } else if (
            [
              "INVOICE_CREATED",
              "INVOICE_PAYMENT",
              "INVOICE_CANCELLED",
            ].includes(notificationType)
          ) {
            const invoiceIdMatch = data.message.match(/#(\d+)/) || [];
            const invoiceId = invoiceIdMatch[1] || "N/A";
            const suffix =
              notificationType === "INVOICE_PAYMENT" &&
              data.message.includes("VNPay")
                ? " qua VNPay"
                : "";
            displayMessage = `Người dùng ${username} đã ${actionMap[notificationType]} #${invoiceId}${suffix}`;
          }

          // Chỉ thêm thông báo nếu phù hợp với tab hiện tại
          if (
            activeTab === "all" ||
            (activeTab === "invoice" &&
              notificationType === selectedInvoiceType) ||
            (activeTab === "review" && notificationType === "REVIEW_UPDATED")
          ) {
            handleNewNotification({ ...data, message: displayMessage });

            setNotifications((prev) => {
              const updatedNotifications = [
                {
                  id: data.notificationId || `temp-id-${Date.now()}`,
                  message: data.message,
                  displayMessage,
                  type: data.type || "UNKNOWN",
                  source: data.source || "UNKNOWN",
                  isRead: false,
                  createdAt: data.createdAt || new Date().toISOString(),
                  userId: data.userId,
                },
                ...prev,
              ];
              prevNotificationsRef.current = updatedNotifications;
              return updatedNotifications;
            });
            setUnreadCount((prev) => prev + 1);
            setNotificationTotal((prev) => prev + 1);
          }
        });
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
    <div
      className="notification-dropdown"
      style={{ padding: "0px", width: "400px" }}
    >
      <div style={{ padding: "10px 0px 8px 10px" }}>
        <Text strong style={{ fontSize: "16px", color: "#333" }}>
          Thông báo
        </Text>
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setNotifications([]);
          if (key === "invoice") {
            setSelectedInvoiceType("INVOICE_CREATED");
          }
        }}
        items={[
          {
            key: "all",
            label: "Tất cả",
          },
          {
            key: "invoice",
            label: "Hóa đơn",
            children: (
              <Select
                value={selectedInvoiceType}
                onChange={(value) => {
                  setSelectedInvoiceType(value);
                  setNotifications([]);
                }}
                style={{ width: "100%", marginBottom: "10px" }}
              >
                <Option value="INVOICE_CREATED">Đã đặt hàng</Option>
                <Option value="INVOICE_PAYMENT">Thanh toán thành công</Option>
                <Option value="REVIEW_CREATED">Đã tạo đánh giá</Option>
                <Option value="REVIEW_DELETED">Đã xóa đánh giá</Option>
                <Option value="INVOICE_CANCELLED">Hủy đơn hàng</Option>
              </Select>
            ),
          },
          {
            key: "review",
            label: "Đánh giá",
          },
        ]}
        style={{ padding: "0 10px" }}
      />
      <div
        className="notification-list"
        style={{ maxHeight: "280px", overflowY: "auto" }}
      >
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
                onClick={() => {
                  if (!notification.isRead) handleMarkAsRead(notification.id);
                  const config = notificationConfig[notification.type] || {
                    route: "/admin/invoice",
                    label: "Hóa đơn",
                    color: "default",
                  };
                  navigate(config.route);
                }}
                style={{ borderTop: "1px solid #e8e8e8", cursor: "pointer" }}
              >
                <Space align="start" style={{ width: "100%", padding: "10px" }}>
                  <BellOutlined
                    style={{
                      fontSize: "16px",
                      color: "#1890ff",
                      marginTop: "4px",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text strong>{notification.displayMessage}</Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {getTimeAgo(notification.createdAt)}
                    </Text>
                    <Space style={{ marginTop: "4px" }}>
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
                  </div>
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
