import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import {
  Table as AntTable,
  Button,
  Pagination,
  Modal,
  Form,
  Select,
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

const { Option } = Select;
const { Text, Title } = Typography;

// Định nghĩa các trạng thái hóa đơn
const INVOICE_STATUSES = [
  { value: "PENDING", label: "Chờ xử lý", color: "orange" },
  { value: "CONFIRMED", label: "Đã xác nhận", color: "blue" },
  { value: "SHIPPING", label: "Đang giao", color: "cyan" },
  { value: "DELIVERED", label: "Đã giao", color: "green" },
  { value: "PAID", label: "Đã thanh toán", color: "green" },
  { value: "FAILED", label: "Thất bại", color: "purple" },
  { value: "CANCELLED", label: "Đã hủy", color: "red" },
  { value: "RETURNED", label: "Đã trả hàng", color: "volcano" },
];

const VALID_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["DELIVERED", "CANCELLED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  PAID: ["RETURNED"],
  FAILED: ["CANCELLED", "PENDING"],
  CANCELLED: [],
  RETURNED: [],
};

const AdminInvoiceList = () => {
  const [data, setData] = useState([]);
  const [validData, setValidData] = useState([]);
  const [filters, setFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationTotal, setNotificationTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationPage, setNotificationPage] = useState(1);
  const [form] = Form.useForm();
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
      ); // Không lọc type để lấy cả INVOICE_CREATED và INVOICE_CANCELLED
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
  const handleUpdateStatus = async (values) => {
    const cleanStatus = values.status.replace(/['"]/g, "");
    setLoading(true);
    try {
      const response = await updateStatusInvoice(
        currentInvoice.id,
        cleanStatus,
      );

      const finalStatus =
        currentInvoice.paymentMethod === "COD" && cleanStatus === "DELIVERED"
          ? "PAID"
          : cleanStatus;
      const statusLabel =
        INVOICE_STATUSES.find((s) => s.value === finalStatus)?.label ||
        finalStatus;

      Swal.fire({
        title: "Cập nhật thành công!",
        text:
          response.message ||
          `Hóa đơn đã được cập nhật trạng thái thành ${statusLabel}.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setStatusModalVisible(false);
      form.resetFields();
      fetchData();
      setDetailModalVisible(false);
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: error.response?.data?.message || "Không thể cập nhật trạng thái.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
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
        `${new Date(record.discount.startDate).toLocaleDateString("vi-VN")} - ${new Date(
          record.discount.endDate,
        ).toLocaleDateString("vi-VN")}`,
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

  const getValidStatusOptions = (currentStatus) => {
    const validStatuses = VALID_TRANSITIONS[currentStatus] || [];
    return INVOICE_STATUSES.filter((status) =>
      validStatuses.includes(status.value),
    );
  };

  return (
    <div className="wrapper">
      <header className={styles.adminHeader}>
        <div className="container">
          <h2>QUẢN LÝ HÓA ĐƠN</h2>
          {/* <Badge count={unreadCount}>
            <Button
              icon={<BellOutlined />}
              onClick={() => setNotificationModalVisible(true)}
              style={{ marginLeft: 16 }}
            >
              Thông báo
            </Button>
          </Badge> */}
        </div>
      </header>
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
            footer={
              currentInvoice &&
              VALID_TRANSITIONS[currentInvoice.status]?.length > 0 ? (
                <Button
                  type="primary"
                  onClick={() => setStatusModalVisible(true)}
                >
                  Cập nhật trạng thái
                </Button>
              ) : null
            }
            width={1000}
            centered
          >
            {currentInvoice && (
              <div className={styles.detailModal}>
                <Title level={4}>Thông tin hóa đơn</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <p>
                      <strong>Mã đơn:</strong> {currentInvoice.id}
                    </p>
                    <p>
                      <strong>Người mua:</strong> {currentInvoice.user.username}
                    </p>
                    <p>
                      <strong>SĐT:</strong> {currentInvoice.user.phoneNumber}
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong>{" "}
                      {`${currentInvoice.address.street}, ${currentInvoice.address.city}, ${currentInvoice.address.country}`}
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

                {currentInvoice.discount &&
                  currentInvoice.discount.length > 0 && (
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
            title="Cập nhật trạng thái hóa đơn"
            visible={statusModalVisible}
            onCancel={() => setStatusModalVisible(false)}
            footer={null}
          >
            <Form form={form} onFinish={handleUpdateStatus} layout="vertical">
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  {currentInvoice &&
                    getValidStatusOptions(currentInvoice.status).map(
                      (status) => (
                        <Option key={status.value} value={status.value}>
                          {status.label}
                        </Option>
                      ),
                    )}
                </Select>
              </Form.Item>
              <Text
                type="secondary"
                style={{ display: "block", marginBottom: 16 }}
              >
                Lưu ý:
                {currentInvoice?.paymentMethod === "COD" &&
                currentInvoice?.status === "SHIPPING"
                  ? " Chọn 'Đã giao' sẽ tự động cập nhật thành 'Đã thanh toán' cho hóa đơn COD."
                  : " Trạng thái sẽ được cập nhật và thông báo sẽ được gửi đến khách hàng."}
              </Text>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Cập nhật
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  onClick={() => setStatusModalVisible(false)}
                >
                  Hủy
                </Button>
              </Form.Item>
            </Form>
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
