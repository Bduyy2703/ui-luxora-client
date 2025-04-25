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
  Table as AntTable,
  Button,
  Modal,
  Pagination,
  Badge,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logOut } from "../../../services/api/authService";
import {
  getAllNotifications,
  markNotificationAsReadAdmin,
} from "../../../services/api/notifications";
import io from "socket.io-client";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "./sidebar.css";

const { Text } = Typography;

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lastPathSegment = location.pathname.split("/").pop();

  const [selectedKeys, setSelectedKeys] = useState([lastPathSegment]);
  const [openKeys, setOpenKeys] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationTotal, setNotificationTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationPage, setNotificationPage] = useState(1);
  const [notificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const notificationLimit = 10;

  // Token và URL API
  const token = localStorage.getItem("accessToken") || "your-jwt-token";
  const API_BASE_URL = "http://35.247.185.8/";

  // Lấy danh sách thông báo
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await getAllNotifications(
        notificationPage,
        notificationLimit,
        "",
      );
      setNotifications(response.notifications);
      setNotificationTotal(response.total);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải danh sách thông báo.",
        icon: "error",
      });
    }
  }, [notificationPage]);

  // Đánh dấu thông báo đã đọc
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsReadAdmin(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể đánh dấu thông báo đã đọc.",
        icon: "error",
      });
    }
  };

  // Kết nối WebSocket để nhận thông báo thời gian thực
  useEffect(() => {
    const socket = io(API_BASE_URL, {
      auth: { token: `Bearer ${token}` },
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket");
    });

    socket.on("notification", (data) => {
      if (
        (data.type === "INVOICE_CREATED" ||
          data.type === "INVOICE_CANCELLED" ||
          data.type === "INVOICE_PAYMENT") &&
        data.source === "USER"
      ) {
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
        setNotificationTotal((prev) => prev + 1);
        setUnreadCount((prev) => prev + 1);
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
    });

    return () => socket.disconnect();
  }, [token]);

  // Lấy thông báo ban đầu
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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

  const notificationColumns = [
    {
      title: "Thông báo",
      dataIndex: "message",
      key: "message",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "isRead",
      key: "isRead",
      render: (isRead) => (
        <Tag color={isRead ? "default" : "blue"}>
          {isRead ? "Đã đọc" : "Chưa đọc"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (row) =>
        !row.isRead && (
          <Button type="link" onClick={() => handleMarkAsRead(row.id)}>
            Đánh dấu đã đọc
          </Button>
        ),
    },
  ];

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
        {
          key: "blog",
          label: <Link to="/admin/blog">Blog</Link>,
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
          label: <Link to="/admin/invoice">Đơn hàng</Link>,
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
  ];

  return (
    <aside className="sidebar">
      <div className="info">
        <div className="logo">
          <img
            width="230"
            height="50"
            src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/logo.png"
            alt="Caraluna"
          />
        </div>
      </div>
      <div className="notification-section">
        <div
          className="notification-item"
          onClick={() => setNotificationModalVisible(true)}
        >
          <Badge count={unreadCount} size="small" offset={[5, 0]}>
            <BellOutlined
              style={{ fontSize: "20px", marginRight: "8px", color: "white" }}
            />
          </Badge>
          <span>Thông báo</span>
        </div>
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
      <Modal
        title="Thông báo"
        open={notificationModalVisible}
        onCancel={() => setNotificationModalVisible(false)}
        footer={null}
        width={800}
      >
        <AntTable
          dataSource={notifications}
          columns={notificationColumns}
          rowKey="id"
          pagination={false}
        />
        {notificationTotal > notificationLimit && (
          <Pagination
            current={notificationPage}
            pageSize={notificationLimit}
            total={notificationTotal}
            onChange={(page) => setNotificationPage(page)}
            style={{ marginTop: 16, textAlign: "right" }}
          />
        )}
      </Modal>
    </aside>
  );
};

export default Sidebar;
