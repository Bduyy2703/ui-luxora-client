import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import {
  Table as AntTable,
  Button,
  Pagination,
  Modal,
  Tooltip,
  Typography,
  Row,
  Col,
  Tag,
  Badge,
} from "antd";
import { toast } from "react-toastify";
import Filter from "../../../components/admin/filter/Filter";
import config from "../../../config";
import { InfoCircleOutlined, BellOutlined } from "@ant-design/icons";
import styles from "./index.module.scss";
import {
  getAllInvoices,
  getInvoiceById,
  updateStatusInvoice,
} from "../../../services/api/invoiceService";
import {
  getAllNotifications,
  markNotificationAsReadAdmin,
} from "../../../services/api/notifications";
import io from "socket.io-client";
import {
  PayCircleOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  IssuesCloseOutlined,
  ClockCircleOutlined,
  CarOutlined,
  GiftOutlined,
  RollbackOutlined,
  WarningOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

const statusTimeline = [
  { status: "PENDING", display: "Đang chờ", icon: <IssuesCloseOutlined /> },
  {
    status: "CONFIRMED",
    display: "Đã xác nhận",
    icon: <ClockCircleOutlined />,
  },
  { status: "SHIPPING", display: "Đang giao hàng", icon: <CarOutlined /> },
  { status: "DELIVERED", display: "Đã giao hàng", icon: <GiftOutlined /> },
  { status: "PAID", display: "Đã thanh toán", icon: <CheckCircleOutlined /> },
  { status: "CANCELLED", display: "Đã hủy", icon: <CloseCircleOutlined /> },
  { status: "FAILED", display: "Thất bại", icon: <WarningOutlined /> },
  { status: "RETURNED", display: "Đã trả hàng", icon: <RollbackOutlined /> },
];

const validTransitions = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["DELIVERED", "CANCELLED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  PAID: ["RETURNED"],
  FAILED: ["CANCELLED", "PENDING"],
  CANCELLED: [],
  RETURNED: [],
};

// Định nghĩa các trạng thái hóa đơn (đồng bộ với RETURNED)
const INVOICE_STATUSES = [
  { value: "PENDING", label: "Chờ xử lý", color: "orange" },
  { value: "CONFIRMED", label: "Đã xác nhận", color: "blue" },
  { value: "SHIPPING", label: "Đang giao", color: "cyan" },
  { value: "DELIVERED", label: "Đã giao", color: "green" },
  { value: "PAID", label: "Đã thanh toán", color: "green" },
  { value: "FAILED", label: "Thất bại", color: "purple" },
  { value: "CANCELLED", label: "Đã hủy", color: "red" },
  { value: "RETURNED", label: "Đã trả hàng", color: "volcano" }, // Sửa từ RETURNACKNOWLEDGED thành RETURNED
];

const AdminInvoiceList = () => {
  const [data, setData] = useState([]);
  const [validData, setValidData] = useState([]);
  const [filters, setFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationTotal, setNotificationTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationPage, setNotificationPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const limit = config.LIMIT || 10;
  const notificationLimit = 10;

  // Token và URL API
  const token = localStorage.getItem("accessToken") || "your-jwt-token";
  const API_BASE_URL = "https://dclux.store/";

  // Lấy danh sách hóa đơn
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const invoices = await getAllInvoices();
      setData(invoices);
      setValidData(invoices);
      setTotal(invoices.length);
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải danh sách hóa đơn.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Xem chi tiết hóa đơn
  const handleViewDetail = async (invoice) => {
    setLoading(true);
    try {
      const invoiceDetail = await getInvoiceById(invoice.id);
      setCurrentInvoice(invoiceDetail);
      setSelectedStatus(invoiceDetail.status);
      setDetailModalVisible(true);
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải chi tiết hóa đơn.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật trạng thái hóa đơn
  const handleUpdateStatus = async (newStatus) => {
    const statusLabel = statusTimeline.find(
      (s) => s.status === newStatus,
    )?.display;
    Swal.fire({
      title: "Xác nhận",
      text: `Bạn có chắc muốn cập nhật trạng thái thành ${statusLabel}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Cập nhật",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const response = await updateStatusInvoice(
            currentInvoice.id,
            newStatus,
          );
          Swal.fire({
            title: "Cập nhật thành công!",
            text:
              response.message ||
              `Hóa đơn đã được cập nhật trạng thái thành ${statusLabel}.`,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });

          setSelectedStatus(newStatus);
          fetchData();
          setCurrentInvoice({ ...currentInvoice, status: newStatus });
        } catch (error) {
          Swal.fire({
            title: "Lỗi!",
            text:
              error.response?.data?.message || "Không thể cập nhật trạng thái.",
            icon: "error",
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

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

  // Kết nối WebSocket
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

  // Lấy danh sách hóa đơn
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cài đặt bộ lọc
  useEffect(() => {
    setFilters([
      {
        key: "status",
        header: "Trạng thái",
        options: ["Tất cả", ...INVOICE_STATUSES.map((s) => s.value)],
      },
      {
        key: "paymentMethod",
        header: "Phương thức",
        options: ["Tất cả", "VNPAY", "COD"],
      },
    ]);
  }, []);

  const columns = [
    { title: "Mã đơn", dataIndex: "id", key: "id" },
    {
      title: "Người mua",
      dataIndex: ["user", "username"],
      key: "username",
      render: (text) => text || "N/A",
    },
    {
      title: "Tổng tiền",
      dataIndex: "finalTotal",
      key: "finalTotal",
      render: (text) => `${parseFloat(text).toLocaleString()} VNĐ`,
      align: "right",
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        const status = INVOICE_STATUSES.find((s) => s.value === text);
        return (
          <Tag color={status?.color || "default"}>{status?.label || text}</Tag>
        );
      },
      align: "center",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (row) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<InfoCircleOutlined />}
              onClick={() => handleViewDetail(row)}
              style={{ border: "none", color: "#1890ff" }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const itemColumns = [
    {
      title: "Tên sản phẩm",
      dataIndex: ["productDetail", "name"],
      key: "name",
    },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (text) => `${parseFloat(text).toLocaleString()} VNĐ`,
    },
    {
      title: "Tổng phụ",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (text) => `${parseFloat(text).toLocaleString()} VNĐ`,
    },
  ];

  const discountColumns = [
    { title: "Tên mã giảm giá", dataIndex: ["discount", "name"], key: "name" },
    {
      title: "Điều kiện",
      dataIndex: ["discount", "condition"],
      key: "condition",
      render: (text) =>
        text === "TOTAL" ? "Giảm trên tổng tiền" : "Giảm phí vận chuyển",
    },
    {
      title: "Giá trị giảm",
      dataIndex: ["discount", "discountValue"],
      key: "discountValue",
      render: (text, record) =>
        `${text}${record.discount.discountType === "PERCENTAGE" ? "%" : " VNĐ"}`,
    },
    {
      title: "Thời gian áp dụng",
      dataIndex: ["discount", "startDate"],
      key: "time",
      render: (text, record) =>
        `${new Date(record.discount.startDate).toLocaleDateString("vi-VN")} - ${new Date(record.discount.endDate).toLocaleDateString("vi-VN")}`,
    },
  ];

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

  const isMainFlowStatus = (status) => {
    return ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "PAID"].includes(
      status,
    );
  };

  const getValidNextStatuses = (currentStatus) => {
    return validTransitions[currentStatus] || [];
  };

  return (
    <div className="wrapper">
      <div
        className="container"
        style={{
          background:
            "linear-gradient(90deg, #f3e0bf, rgba(253, 252, 243, 0.7))",
          height: "70px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h2>QUẢN LÝ HÓA ĐƠN</h2>
      </div>
      <main className="main">
        <div className="container">
          <div className="card">
            <div className="card-header">
              <div className="card-tools">
                <Filter
                  filters={filters}
                  data={data}
                  validData={validData}
                  setValidData={setValidData}
                  standardSort={[
                    { name: "Mã đơn", type: "id" },
                    { name: "Người mua", type: "username" },
                    { name: "Ngày tạo", type: "createdAt" },
                    { name: "Trạng thái", type: "status" },
                    { name: "Phương thức", type: "paymentMethod" },
                  ]}
                  searchFields={[
                    { key: "id", placeholder: "Tìm theo mã đơn" },
                    { key: "username", placeholder: "Tìm theo người mua" },
                  ]}
                />
              </div>
            </div>
            <div className="card-body">
              <AntTable
                dataSource={validData.slice(
                  (currentPage - 1) * limit,
                  currentPage * limit,
                )}
                columns={columns}
                rowKey="id"
                pagination={false}
                loading={loading}
              />
            </div>
            {total > limit && (
              <div className={styles.pagination}>
                <Pagination
                  current={currentPage}
                  pageSize={limit}
                  total={total}
                  onChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </div>

          <Modal
            title="Chi tiết hóa đơn"
            visible={detailModalVisible}
            onCancel={() => setDetailModalVisible(false)}
            footer={null}
            width={1000}
            centered
          >
            {currentInvoice && (
              <div className={styles.detailModal}>
                <Title level={4}>Trạng thái hóa đơn</Title>
                <div className={styles.timeline}>
                  {loading ? (
                    <div className={styles.loading}>Đang cập nhật...</div>
                  ) : (
                    statusTimeline.map((step, index) => {
                      const isActive = step.status === currentInvoice.status;
                      const isValid = getValidNextStatuses(
                        currentInvoice.status,
                      ).includes(step.status);
                      const isLastStep = index === statusTimeline.length - 1;
                      const isException = [
                        "CANCELLED",
                        "FAILED",
                        "RETURNED",
                      ].includes(step.status);
                      // Luôn hiển thị trạng thái chính, chỉ hiển thị trạng thái ngoại lệ nếu là hiện tại hoặc hợp lệ
                      const shouldDisplay =
                        isMainFlowStatus(step.status) ||
                        (isException && (isActive || isValid));

                      return shouldDisplay ? (
                        <div
                          key={step.status}
                          className={`${styles.timelineStep} 
                            ${isActive ? styles.active : ""}
                            ${isValid ? styles.valid : ""}
                            ${isValid && !isActive ? styles.clickable : ""}`}
                          onClick={() =>
                            isValid && handleUpdateStatus(step.status)
                          }
                        >
                          <div className={styles.timelineIcon}>{step.icon}</div>
                          <div className={styles.timelineLabel}>
                            {step.display}
                          </div>
                          {!isLastStep && isMainFlowStatus(step.status) && (
                            <div className={styles.timelineArrow}>→</div>
                          )}
                        </div>
                      ) : null;
                    })
                  )}
                </div>

                <Title level={4} style={{ marginTop: 24 }}>
                  Thông tin hóa đơn
                </Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <p>
                      <strong>Mã đơn:</strong> {currentInvoice.id}
                    </p>
                    <p>
                      <strong>Người mua:</strong>{" "}
                      {currentInvoice.user?.username || "N/A"}
                    </p>
                    <p>
                      <strong>SĐT:</strong>{" "}
                      {currentInvoice.user?.phoneNumber || "N/A"}
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong>{" "}
                      {currentInvoice.address
                        ? `${currentInvoice.address.street}, ${currentInvoice.address.city}, ${currentInvoice.address.country}`
                        : "N/A"}
                    </p>
                  </Col>
                  <Col xs={24} md={12}>
                    <p>
                      <strong>Phương thức:</strong>{" "}
                      {currentInvoice.paymentMethod}
                    </p>
                    <p>
                      <strong>Trạng thái:</strong>{" "}
                      <Tag
                        color={
                          INVOICE_STATUSES.find(
                            (s) => s.value === currentInvoice.status,
                          )?.color || "default"
                        }
                      >
                        {INVOICE_STATUSES.find(
                          (s) => s.value === currentInvoice.status,
                        )?.label || currentInvoice.status}
                      </Tag>
                    </p>
                    <p>
                      <strong>Ngày tạo:</strong>{" "}
                      {new Date(currentInvoice.createdAt).toLocaleString(
                        "vi-VN",
                      )}
                    </p>
                    <p>
                      <strong>Ngày cập nhật:</strong>{" "}
                      {new Date(currentInvoice.updatedAt).toLocaleString(
                        "vi-VN",
                      )}
                    </p>
                  </Col>
                </Row>

                <Title level={4} style={{ marginTop: 24 }}>
                  Danh sách sản phẩm
                </Title>
                <AntTable
                  dataSource={currentInvoice.items}
                  columns={itemColumns}
                  rowKey="id"
                  pagination={false}
                />

                <Title level={4} style={{ marginTop: 24 }}>
                  Chi tiết tài chính
                </Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <p>
                      <strong>Tổng tiền sản phẩm:</strong>{" "}
                      {parseFloat(
                        currentInvoice.totalProductAmount,
                      ).toLocaleString()}{" "}
                      VNĐ
                    </p>
                    <p>
                      <strong>Phí vận chuyển:</strong>{" "}
                      {parseFloat(currentInvoice.shippingFee).toLocaleString()}{" "}
                      VNĐ
                    </p>
                    <p>
                      <strong>Giảm giá phí vận chuyển:</strong>{" "}
                      {parseFloat(
                        currentInvoice.shippingFeeDiscount,
                      ).toLocaleString()}{" "}
                      VNĐ
                    </p>
                  </Col>
                  <Col xs={24} md={12}>
                    <p>
                      <strong>Giảm giá sản phẩm:</strong>{" "}
                      {parseFloat(
                        currentInvoice.productDiscount,
                      ).toLocaleString()}{" "}
                      VNĐ
                    </p>
                    <p>
                      <strong>Tổng tiền cuối cùng:</strong>{" "}
                      <span style={{ color: "#1890ff", fontWeight: "bold" }}>
                        {parseFloat(currentInvoice.finalTotal).toLocaleString()}{" "}
                        VNĐ
                      </span>
                    </p>
                  </Col>
                </Row>

                {currentInvoice.discount?.length > 0 && (
                  <>
                    <Title level={4} style={{ marginTop: 24 }}>
                      Thông tin giảm giá
                    </Title>
                    <AntTable
                      dataSource={currentInvoice.discount}
                      columns={discountColumns}
                      rowKey="id"
                      pagination={false}
                    />
                  </>
                )}
              </div>
            )}
          </Modal>

          <Modal
            title="Thông báo"
            visible={notificationModalVisible}
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
        </div>
      </main>
    </div>
  );
};

export default AdminInvoiceList;
