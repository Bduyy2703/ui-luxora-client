import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Modal,
  Button,
  Pagination,
  Image,
  Tooltip,
  Table as AntTable,
  Switch,
  Select,
  Tabs,
  Card,
  Statistic,
  DatePicker,
  InputNumber,
  Progress,
  Rate,
  Input,
  Badge,
  Dropdown,
  Space,
  Typography,
  Tag,
} from "antd";
import Swal from "sweetalert2";
import Filter from "../../../components/admin/filter/Filter";
import config from "../../../config";
import {
  InfoOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  BellOutlined,
} from "@ant-design/icons";
import styles from "./index.module.scss";
import {
  getAllReviews,
  toggleHiddenReview,
  adminDeleteReview,
  getTopRatedProduct,
  getLowestRatedProduct,
  getMostReviewedProduct,
  getProductsByRating,
  getProductReviewStatistics,
  replyToReview,
} from "../../../services/api/reviewService";
import {
  getNotificationsByTypes,
  markNotificationAsRead,
} from "../../../services/api/notifications";
import io from "socket.io-client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getUserIdByAdmin } from "../../../services/api/userService";

const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Text } = Typography;
const { TextArea } = Input;

// Hàm định dạng giá tiền
const formatPrice = (price) => {
  if (!price) return "N/A";
  return `${parseFloat(price).toLocaleString("vi-VN")} VNĐ`;
};

// Hàm định dạng ngày
const formatDate = (date) => {
  return date ? new Date(date).toLocaleString("vi-VN") : "N/A";
};

const AdminReviewList = () => {
  const [data, setData] = useState([]);
  const [validData, setValidData] = useState([]);
  const [filters, setFilters] = useState([]);
  const [checkedRow, setCheckedRow] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [currentReviewImages, setCurrentReviewImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isHiddenFilter, setIsHiddenFilter] = useState(undefined);
  const [productIdFilter, setProductIdFilter] = useState(undefined);
  const [userIdFilter, setUserIdFilter] = useState(undefined);
  const [ratingFilter, setRatingFilter] = useState(undefined);
  const [dateRangeFilter, setDateRangeFilter] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [topRatedProduct, setTopRatedProduct] = useState(null);
  const [lowestRatedProduct, setLowestRatedProduct] = useState(null);
  const [mostReviewedProduct, setMostReviewedProduct] = useState(null);
  const [productsByRating, setProductsByRating] = useState([]);
  const [productStatistics, setProductStatistics] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyContentAdmin, setReplyContentAdmin] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [usersMap, setUsersMap] = useState({});
  const [notificationPage, setNotificationPage] = useState(1);
  const [hasInteracted, setHasInteracted] = useState(false);
  const limit = config.LIMIT || 10;
  const notificationLimit = 10;

  const notificationSound = new Audio("/assets/sounds/notificationFinal.mp3");
  const accessToken = localStorage.getItem("accessToken");

  const standardSort = ["product.name", "createdAt"];

  // Xử lý tương tác để bật âm thanh
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

  // Lấy danh sách đánh giá
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllReviews(
        currentPage,
        limit,
        isHiddenFilter,
        productIdFilter,
        userIdFilter,
      );
      if (res.error) {
        throw new Error(res.error);
      }
      let items = res?.reviews || [];

      // Fetch user details for all unique userIds
      const uniqueUserIds = [...new Set(items.map((item) => item.userId))];
      const userPromises = uniqueUserIds.map(async (userId) => {
        // Check the current state of usersMap without causing a dependency
        if (!usersMap[userId]) {
          try {
            const userData = await getUserIdByAdmin(userId);
            return { userId, userData };
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            return { userId, userData: null }; // Fallback for failed user fetch
          }
        }
        return { userId, userData: usersMap[userId] };
      });
      const userResults = await Promise.all(userPromises);
      const newUsersMap = userResults.reduce(
        (acc, { userId, userData }) => {
          if (userData) {
            acc[userId] = userData;
          }
          return acc;
        },
        { ...usersMap }, // Preserve existing usersMap
      );

      // Update usersMap only if there are new users
      if (Object.keys(newUsersMap).length !== Object.keys(usersMap).length) {
        setUsersMap(newUsersMap);
      }

      // Apply filters
      if (ratingFilter !== undefined) {
        items = items.filter((item) => item.rating >= ratingFilter);
      }

      if (dateRangeFilter.length === 2) {
        const [startDate, endDate] = dateRangeFilter;
        items = items.filter((item) => {
          const createdAt = new Date(item.createdAt);
          return createdAt >= startDate && createdAt <= endDate;
        });
      }

      setData(items);
      setValidData(items);
      setTotal(res.total || 0);
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá hoặc thông tin người dùng:", error);
      setData([]);
      setValidData([]);
      Swal.fire({
        title: "Lỗi!",
        text:
          error.message ||
          "Không thể tải danh sách đánh giá hoặc thông tin người dùng.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    limit,
    isHiddenFilter,
    productIdFilter,
    userIdFilter,
    ratingFilter,
    dateRangeFilter,
    // Remove usersMap from dependencies
  ]);

  // Lấy thống kê sản phẩm
  const fetchStatistics = useCallback(async () => {
    try {
      const topRated = await getTopRatedProduct();
      const lowestRated = await getLowestRatedProduct();
      const mostReviewed = await getMostReviewedProduct();
      const productsByRatingRes = await getProductsByRating("DESC", 1, 10);

      if (topRated.error) throw new Error(topRated.error);
      if (lowestRated.error) throw new Error(lowestRated.error);
      if (mostReviewed.error) throw new Error(mostReviewed.error);
      if (productsByRatingRes.error) throw new Error(productsByRatingRes.error);

      setTopRatedProduct(topRated);
      setLowestRatedProduct(lowestRated);
      setMostReviewedProduct(mostReviewed);
      setProductsByRating(productsByRatingRes.products || []);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê:", error);
      Swal.fire({
        title: "Lỗi!",
        text: error.message || "Không thể tải dữ liệu thống kê.",
        icon: "error",
      });
    }
  }, []);

  // Lấy thống kê chi tiết sản phẩm
  const fetchProductStatistics = async (productId) => {
    try {
      const res = await getProductReviewStatistics(productId);
      if (res.error) throw new Error(res.error);
      setProductStatistics(res);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê sản phẩm:", error);
      setProductStatistics(null);
      Swal.fire({
        title: "Lỗi!",
        text: error.message || "Không thể tải thống kê sản phẩm.",
        icon: "error",
      });
    }
  };

  // Lấy thông báo
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await getNotificationsByTypes(
        notificationPage,
        notificationLimit,
      );
      setNotifications(response.notifications || []);
      setUnreadNotifications(response.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [notificationPage]);

  // Xử lý WebSocket cho thông báo
  useEffect(() => {
    if (accessToken) {
      fetchNotifications();

      if (window.Notification) {
        if (Notification.permission === "default") {
          Notification.requestPermission().then((permission) => {
            if (permission === "denied") {
              Swal.fire({
                title: "Thông báo bị chặn",
                text: "Vui lòng bật quyền thông báo trong cài đặt trình duyệt.",
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

      socket.on("connect", () => {
        console.log("WebSocket connected");
      });

      socket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error.message);
      });

      socket.on("notification", (data) => {
        const notificationType = data.type?.trim();
        const notificationSource = data.source?.trim();

        if (
          notificationSource === "USER" &&
          ["REVIEW_CREATED", "REVIEW_UPDATED", "REVIEW_DELETED"].includes(
            notificationType,
          )
        ) {
          toast.info(
            <div>
              <strong>Thông báo Đánh giá!</strong>
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
                onClick={() => {
                  setCurrentPage(1);
                  fetchData();
                }}
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
            const systemNotification = new Notification("Thông báo Đánh giá!", {
              body: data.message,
              icon: "/assets/icon/bell.png",
              tag: data.notificationId,
            });

            systemNotification.onclick = () => {
              window.focus();
              fetchData();
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

          // Làm mới danh sách đánh giá
          fetchData();
        }
      });

      socket.on("disconnect", () => {
        console.log("WebSocket disconnected");
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [accessToken, fetchNotifications, fetchData, hasInteracted]);

  // Xóa đánh giá
  const handleDeleteReview = async () => {
    if (!Array.isArray(checkedRow) || checkedRow.length === 0) {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng chọn ít nhất một đánh giá để xóa.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      setLoading(true);
      try {
        await Promise.all(checkedRow.map((id) => adminDeleteReview(id)));
        Swal.fire({
          title: "Đã xóa!",
          text: "Đánh giá đã được xóa thành công.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchData();
        setCheckedRow([]);
      } catch (error) {
        Swal.fire({
          title: "Lỗi!",
          text: error.message || "Đã xảy ra lỗi khi xóa đánh giá.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Ẩn/hiện đánh giá
  const handleToggleHidden = async (id, isHidden) => {
    setLoading(true);
    try {
      const res = await toggleHiddenReview(id);
      if (res.error) {
        throw new Error(res.error);
      }
      Swal.fire({
        title: isHidden ? "Đã ẩn!" : "Đã hiển thị!",
        text: `Đánh giá đã được ${isHidden ? "ẩn" : "hiển thị"} thành công.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchData();
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text:
          error.message || "Đã xảy ra lỗi khi cập nhật trạng thái đánh giá.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (review) => {
    setCurrentReview(review);
    setCurrentReviewImages(review.images || []);
    setReplyContent(review.reply || "");
    setReplyContentAdmin(review.reply?.admin?.content || "");
    await fetchProductStatistics(review.productId);
    setCurrentUser(usersMap[review.userId] || null);
    setDetailModalVisible(true);

    try {
      if (!usersMap[review.userId]) {
        const userData = await getUserIdByAdmin(review.userId);
        setUsersMap((prev) => ({ ...prev, [review.userId]: userData }));
        setCurrentUser(userData);
      }
      await fetchProductStatistics(review.productId);
    } catch (error) {
      console.error("Error fetching user or product statistics:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải thông tin người dùng hoặc thống kê sản phẩm.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
      setDetailModalVisible(true);
    }
  };

  // Trả lời đánh giá
  const handleReplyReview = async () => {
    if (!replyContent.trim()) {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng nhập nội dung trả lời.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await replyToReview(currentReview.id, replyContent);
      if (res.error) {
        throw new Error(res.error);
      }
      Swal.fire({
        title: "Thành công!",
        text: "Đã trả lời đánh giá.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      setDetailModalVisible(false);
      fetchData();
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: error.message || "Đã xảy ra lỗi khi trả lời đánh giá.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

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

  // Cập nhật bộ lọc
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  useEffect(() => {
    setFilters([
      {
        key: "product.name",
        header: "Tên sản phẩm",
        options: [
          "Tất cả",
          ...new Set(data.map((item) => item.product?.name).filter(Boolean)),
        ],
      },
      {
        key: "createdAt",
        header: "Ngày tạo",
        options: [
          "Tất cả",
          ...new Set(
            data
              .map((item) => new Date(item.createdAt).toLocaleDateString())
              .filter(Boolean),
          ),
        ],
      },
      {
        key: "user.email",
        header: "Email người dùng",
        options: [
          "Tất cả",
          ...new Set(data.map((item) => item.user?.email).filter(Boolean)),
        ],
      },
    ]);
  }, [data]);

  // Cột bảng đánh giá
  const reviewColumns = [
    {
      title: "Người dùng",
      key: "user",
      render: (record) => {
        console.log("record", record);

        return <div>{usersMap[record.userId]?.username || "N/A"}</div>;
      },
      width: 200,
    },
    {
      title: "Sản phẩm",
      key: "product",
      render: (record) => record.product?.name || "N/A",
      width: 250,
    },
    {
      title: "Bình luận",
      key: "comment",
      render: (record) => record.comment || "N/A",
      width: 300,
    },
    {
      title: "Rating",
      key: "rating",
      render: (record) => (
        <Rate
          disabled
          value={record.rating}
          style={{ color: "#fadb14", fontSize: 16 }}
        />
      ),
      width: 150,
    },
    {
      title: "Ngày tạo",
      key: "createdAt",
      render: (record) => formatDate(record.createdAt),
      width: 150,
    },
    {
      title: "Trạng thái",
      key: "isHidden",
      render: (record) => (
        <Switch
          checkedChildren={<EyeOutlined />}
          unCheckedChildren={<EyeInvisibleOutlined />}
          checked={!record.isHidden}
          onChange={(checked) => handleToggleHidden(record.id, !checked)}
        />
      ),
      width: 120,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (record) => (
        <div>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<InfoOutlined />}
              onClick={() => handleViewDetails(record)}
              style={{ border: "none", color: "#1890ff" }}
            />
          </Tooltip>
        </div>
      ),
      width: 100,
      align: "center",
    },
  ];

  // Cột bảng sản phẩm theo đánh giá
  const productsByRatingColumns = [
    {
      title: "Hình ảnh",
      key: "images",
      render: (record) => (
        <div className={styles.productImage}>
          {record.images && record.images.length > 0 ? (
            <Image
              src={record.images[0].fileUrl}
              alt="Product Image"
              width={50}
              height={50}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <span>Không có hình ảnh</span>
          )}
        </div>
      ),
      width: 100,
    },
    {
      title: "Sản phẩm",
      key: "product.name",
      render: (record) => record.product?.name || "N/A",
      width: 300,
    },
    {
      title: "Đánh giá trung bình",
      key: "averageRating",
      render: (record) => (
        <Rate
          disabled
          value={Math.round(record.averageRating)}
          style={{ color: "#fadb14", fontSize: 20 }}
        />
      ),
      width: 200,
    },
    {
      title: "Số lượng đánh giá",
      key: "totalReviews",
      render: (record) => record.totalReviews || 0,
      width: 150,
    },
    {
      title: "Giá tiền",
      key: "finalPrice",
      render: (record) => formatPrice(record.product?.finalPrice),
      width: 150,
    },
  ];

  // Menu thông báo
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
                onClick={() => {
                  if (!notification.isRead) handleMarkAsRead(notification.id);
                  fetchData();
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
                        {formatDate(notification.createdAt)}
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
                      <Tag color="blue">
                        {notification.type === "REVIEW_CREATED"
                          ? "Tạo đánh giá"
                          : notification.type === "REVIEW_UPDATED"
                            ? "Cập nhật đánh giá"
                            : "Xóa đánh giá"}
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
      <div
        className={styles.container}
        style={{
          background:
            "linear-gradient(90deg, #f3e0bf, rgba(253, 252, 243, 0.7))",
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2>QUẢN LÝ ĐÁNH GIÁ</h2>
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
      </div>
      <main className={styles.main}>
        <div className={styles.container}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Danh sách đánh giá" key="1">
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTools}>
                    <div className={styles.filterRow}>
                      <Filter
                        filters={filters}
                        data={data}
                        validData={validData}
                        setValidData={setValidData}
                        standardSort={[
                          { name: "Bình luận", type: "comment" },
                          { name: "Email người dùng", type: "user.email" },
                        ]}
                        searchFields={[
                          {
                            key: "comment",
                            placeholder: "Tìm kiếm theo bình luận",
                          },
                          {
                            key: "user.email",
                            placeholder: "Tìm kiếm theo email người dùng",
                          },
                        ]}
                      />
                    </div>
                    <div className={styles.filterRow}>
                      <Select
                        style={{ width: 200, marginRight: 16 }}
                        placeholder="Lọc theo trạng thái"
                        allowClear
                        onChange={(value) => {
                          setIsHiddenFilter(value);
                          setCurrentPage(1);
                        }}
                      >
                        <Option value={true}>Ẩn</Option>
                        <Option value={false}>Hiển thị</Option>
                      </Select>
                      <Select
                        style={{ width: 200, marginRight: 16 }}
                        placeholder="Lọc theo sản phẩm"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        onChange={(value) => {
                          setProductIdFilter(value);
                          setCurrentPage(1);
                        }}
                      >
                        {[...new Set(data.map((item) => item.productId))].map(
                          (productId) => (
                            <Option key={productId} value={productId}>
                              {data.find((item) => item.productId === productId)
                                ?.product?.name || productId}
                            </Option>
                          ),
                        )}
                      </Select>
                      <InputNumber
                        style={{ width: 200, marginRight: 16 }}
                        placeholder="Rating tối thiểu"
                        min={1}
                        max={5}
                        onChange={(value) => {
                          setRatingFilter(value);
                          setCurrentPage(1);
                        }}
                      />
                      <RangePicker
                        onChange={(dates) => {
                          setDateRangeFilter(dates || []);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.cardBtns}>
                    <Button
                      danger
                      onClick={handleDeleteReview}
                      disabled={!checkedRow.length}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <AntTable
                    dataSource={validData}
                    columns={reviewColumns}
                    rowKey={(record) => record.id}
                    pagination={false}
                    rowSelection={{
                      selectedRowKeys: checkedRow,
                      onChange: (selectedRowKeys) =>
                        setCheckedRow(selectedRowKeys),
                    }}
                    loading={loading}
                    className={styles.table}
                    scroll={{ x: "max-content" }}
                  />
                </div>
                {total > limit && (
                  <div className={styles.pagination}>
                    <Pagination
                      current={currentPage}
                      pageSize={limit}
                      total={total}
                      onChange={(page) => setCurrentPage(page)}
                      showSizeChanger={false}
                    />
                  </div>
                )}
              </div>
            </TabPane>
            <TabPane tab="Thống kê" key="2">
              <div className={styles.statisticsSection}>
                <div className={styles.gridContainer}>
                  <Card
                    title="Sản phẩm được đánh giá cao nhất"
                    hoverable
                    className={styles.statCard}
                  >
                    {topRatedProduct ? (
                      <div>
                        {topRatedProduct.images &&
                        topRatedProduct.images.length > 0 ? (
                          <div className={styles.productImage}>
                            <Image
                              src={topRatedProduct.images[0].fileUrl}
                              alt="Product Image"
                              width={100}
                              height={100}
                              style={{ objectFit: "cover", marginBottom: 16 }}
                            />
                          </div>
                        ) : (
                          <p>Không có hình ảnh</p>
                        )}
                        <p>
                          <strong>Tên sản phẩm:</strong>{" "}
                          {topRatedProduct.product?.name || "N/A"}
                        </p>
                        <div className={styles.ratingCircle}>
                          <Progress
                            type="circle"
                            percent={(topRatedProduct.averageRating / 5) * 100}
                            format={() =>
                              `${topRatedProduct.averageRating.toFixed(2)}/5`
                            }
                            strokeColor="#fadb14"
                            width={100}
                            clockwise={false}
                          />
                        </div>
                        <p>
                          <strong>Số lượng đánh giá:</strong>{" "}
                          {topRatedProduct.totalReviews}
                        </p>
                        <p>
                          <strong>Giá tiền:</strong>{" "}
                          {formatPrice(topRatedProduct.product?.finalPrice)}
                        </p>
                      </div>
                    ) : (
                      <p>Không có dữ liệu</p>
                    )}
                  </Card>
                  <Card
                    title="Sản phẩm được đánh giá thấp nhất"
                    hoverable
                    className={styles.statCard}
                  >
                    {lowestRatedProduct ? (
                      <div>
                        {lowestRatedProduct.images &&
                        lowestRatedProduct.images.length > 0 ? (
                          <div className={styles.productImage}>
                            <Image
                              src={lowestRatedProduct.images[0].fileUrl}
                              alt="Product Image"
                              width={100}
                              height={100}
                              style={{ objectFit: "cover", marginBottom: 16 }}
                            />
                          </div>
                        ) : (
                          <p>Không có hình ảnh</p>
                        )}
                        <p>
                          <strong>Tên sản phẩm:</strong>{" "}
                          {lowestRatedProduct.product?.name || "N/A"}
                        </p>
                        <div className={styles.ratingCircle}>
                          <Progress
                            type="circle"
                            percent={
                              (lowestRatedProduct.averageRating / 5) * 100
                            }
                            format={() =>
                              `${lowestRatedProduct.averageRating.toFixed(2)}/5`
                            }
                            strokeColor="#fadb14"
                            width={100}
                            clockwise={false}
                          />
                        </div>
                        <p>
                          <strong>Số lượng đánh giá:</strong>{" "}
                          {lowestRatedProduct.totalReviews}
                        </p>
                        <p>
                          <strong>Giá tiền:</strong>{" "}
                          {formatPrice(lowestRatedProduct.product?.finalPrice)}
                        </p>
                      </div>
                    ) : (
                      <p>Không có dữ liệu</p>
                    )}
                  </Card>
                  <Card
                    title="Sản phẩm có nhiều đánh giá nhất"
                    hoverable
                    className={styles.statCard}
                  >
                    {mostReviewedProduct ? (
                      <div>
                        {mostReviewedProduct.images &&
                        mostReviewedProduct.images.length > 0 ? (
                          <div className={styles.productImage}>
                            <Image
                              src={mostReviewedProduct.images[0].fileUrl}
                              alt="Product Image"
                              width={100}
                              height={100}
                              style={{ objectFit: "cover", marginBottom: 16 }}
                            />
                          </div>
                        ) : (
                          <p>Không có hình ảnh</p>
                        )}
                        <p>
                          <strong>Tên sản phẩm:</strong>{" "}
                          {mostReviewedProduct.product?.name || "N/A"}
                        </p>
                        <p>
                          <strong>Số lượng đánh giá:</strong>{" "}
                          {mostReviewedProduct.totalReviews}
                        </p>
                        <p>
                          <strong>Giá tiền:</strong>{" "}
                          {formatPrice(mostReviewedProduct.product?.finalPrice)}
                        </p>
                      </div>
                    ) : (
                      <p>Không có dữ liệu</p>
                    )}
                  </Card>
                </div>

                <div className={styles.tableContainer}>
                  <Card title="Danh sách sản phẩm theo thứ tự đánh giá">
                    <AntTable
                      dataSource={productsByRating}
                      columns={productsByRatingColumns}
                      rowKey={(record) => record.product?.id || Math.random()}
                      pagination={false}
                      className={styles.table}
                      scroll={{ x: "max-content" }}
                    />
                  </Card>
                </div>
              </div>
            </TabPane>
          </Tabs>

          <Modal
            title={null}
            open={detailModalVisible}
            onCancel={() => {
              setDetailModalVisible(false);
              setCurrentReview(null);
              setCurrentReviewImages([]);
              setProductStatistics(null);
              setReplyContent("");
              setCurrentUser(null);
              setReplyContentAdmin("");
            }}
            footer={null}
            className={styles.reviewDetailModal}
            width={900}
            centered
            bodyStyle={{ padding: 0 }}
          >
            <AnimatePresence>
              {detailModalVisible && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={styles.modalContentWrapper}
                >
                  <div className={styles.modalHeader}>
                    <h2>Chi tiết đánh giá</h2>
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        setCheckedRow([currentReview.id]);
                        handleDeleteReview();
                        setDetailModalVisible(false);
                      }}
                      className={styles.deleteBtn}
                    >
                      Xóa đánh giá
                    </Button>
                  </div>

                  {currentReview ? (
                    <div className={styles.reviewDetailContent}>
                      <motion.div
                        className={styles.reviewInfo}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        <h3>{currentReview.product?.name || "N/A"}</h3>
                        <div className={styles.infoGrid}>
                          <div className={styles.infoItem}>
                            <span className={styles.label}>Người dùng:</span>
                            <p>{currentUser?.username || "N/A"}</p>
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.label}>Rating:</span>
                            <Rate
                              disabled
                              value={currentReview.rating}
                              style={{ color: "#fadb14", fontSize: 20 }}
                            />
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.label}>Bình luận:</span>
                            <p>{currentReview.comment}</p>
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.label}>Ngày tạo:</span>
                            <p>{formatDate(currentReview.createdAt)}</p>
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.label}>Trạng thái:</span>
                            <p
                              className={
                                currentReview.isHidden
                                  ? styles.hiddenStatus
                                  : styles.visibleStatus
                              }
                            >
                              {currentReview.isHidden ? "Ẩn" : "Hiển thị"}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        className={styles.replySection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        {currentReview.reply ? (
                          <div>
                            <p className={styles.replyContent}>
                              <strong>
                                Đã trả lời bởi{" "}
                                {currentReview.reply.admin?.username || "Admin"}
                              </strong>{" "}
                            </p>
                            <TextArea
                              rows={4}
                              value={currentReview.reply.content}
                              onChange={(e) =>
                                setReplyContentAdmin(e.target.value)
                              }
                              placeholder="Nhập nội dung trả lời..."
                              style={{ marginBottom: 16 }}
                              // disabled
                              readOnly
                            />
                          </div>
                        ) : (
                          <>
                            <TextArea
                              rows={4}
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Nhập nội dung trả lời..."
                              style={{ marginBottom: 16 }}
                            />
                            <Button
                              type="primary"
                              onClick={handleReplyReview}
                              loading={loading}
                            >
                              Gửi trả lời
                            </Button>
                          </>
                        )}
                      </motion.div>

                      {(productStatistics ||
                        currentReviewImages.length > 0) && (
                        <motion.div
                          className={styles.combinedSection}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                        >
                          <h3>Thống kê và hình ảnh</h3>
                          <div className={styles.combinedContent}>
                            {productStatistics && (
                              <div className={styles.statsContainer}>
                                <div className={styles.statsGrid}>
                                  <motion.div
                                    className={styles.ratingCircle}
                                    whileHover={{ scale: 1.1 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 300,
                                    }}
                                  >
                                    <Progress
                                      type="circle"
                                      percent={
                                        (productStatistics.averageRating / 5) *
                                        100
                                      }
                                      format={() =>
                                        `${productStatistics.averageRating.toFixed(2)}/5`
                                      }
                                      strokeColor="#fadb14"
                                      width={100}
                                      trailColor="#e6f7ff"
                                    />
                                  </motion.div>
                                  <div className={styles.statsInfo}>
                                    <Statistic
                                      title="Số lượng đánh giá"
                                      value={productStatistics.totalReviews}
                                    />
                                    <div className={styles.ratingDistribution}>
                                      <h4>Phân bố đánh giá:</h4>
                                      {[5, 4, 3, 2, 1].map((star, index) => (
                                        <motion.div
                                          key={star}
                                          className={
                                            styles.ratingDistributionItem
                                          }
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{
                                            delay: 0.6 + index * 0.1,
                                            duration: 0.3,
                                          }}
                                        >
                                          <span className={styles.starLabel}>
                                            {star} sao:
                                          </span>
                                          <Rate
                                            disabled
                                            value={star}
                                            style={{
                                              color: "#fadb14",
                                              fontSize: 16,
                                              marginRight: 8,
                                            }}
                                          />
                                          <span className={styles.ratingCount}>
                                            {productStatistics
                                              .ratingDistribution?.[star] || 0}
                                          </span>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {currentReviewImages.length > 0 && (
                              <div className={styles.imagesContainer}>
                                <h4>Hình ảnh</h4>
                                <div className={styles.imageList}>
                                  {currentReviewImages.map((image, index) => (
                                    <motion.div
                                      key={image.fileId}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{
                                        delay: 0.8 + index * 0.1,
                                        duration: 0.4,
                                      }}
                                      whileHover={{ scale: 1.05 }}
                                      className={styles.imageWrapper}
                                    >
                                      <Image
                                        src={image.fileUrl}
                                        alt="Review Image"
                                        width={120}
                                        height={120}
                                        style={{
                                          objectFit: "cover",
                                          borderRadius: 8,
                                        }}
                                      />
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <p>Không có dữ liệu đánh giá</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Modal>
        </div>
      </main>
    </div>
  );
};

export default AdminReviewList;
