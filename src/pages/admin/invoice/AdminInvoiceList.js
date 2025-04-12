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
  Input,
  Typography,
  Row,
  Col,
  Tag,
} from "antd";
import Filter from "../../../components/admin/filter/Filter";
import config from "../../../config";
import { InfoCircleOutlined } from "@ant-design/icons";
import styles from "./index.module.scss";
import {
  getAllInvoices,
  getInvoiceById,
  updateStatusInvoice,
} from "../../../services/api/invoiceService";

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;

const AdminInvoiceList = () => {
  const [data, setData] = useState([]);
  const [validData, setValidData] = useState([]);
  const [filters, setFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [form] = Form.useForm();
  const limit = config.LIMIT || 10;

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

  const handleUpdateStatus = async (values) => {
    setLoading(true);
    try {
      await updateStatusInvoice(currentInvoice.id, {
        status: values.status,
        note: values.note || "",
      });

      if (values.status === "CANCELLED") {
        Swal.fire({
          title: "Hủy đơn thành công!",
          text: "Số lượng sản phẩm đã được hoàn lại vào kho hàng.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Cập nhật thành công!",
          text: "Hóa đơn đã được cập nhật trạng thái thành PAID.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      setStatusModalVisible(false);
      form.resetFields();
      fetchData();
      setDetailModalVisible(false);
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: error.message || "Không thể cập nhật trạng thái.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setFilters([
      {
        key: "status",
        header: "Trạng thái",
        options: ["Tất cả", "PAID", "PENDING", "FAILED", "CANCELLED"],
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
      render: (text) => (
        <Tag
          color={
            text === "PAID"
              ? "green"
              : text === "CANCELLED"
                ? "red"
                : text === "FAILED"
                  ? "purple"
                  : "orange"
          }
        >
          {text}
        </Tag>
      ),
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

  return (
    <div className="wrapper">
      <header className={styles.adminHeader}>
        <div className="container">
          <h2>QUẢN LÝ ĐƠN HÀNG</h2>
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

          {/* Modal chi tiết hóa đơn */}
          <Modal
            title="Chi tiết hóa đơn"
            visible={detailModalVisible}
            onCancel={() => setDetailModalVisible(false)}
            footer={
              currentInvoice &&
              currentInvoice.paymentMethod === "COD" &&
              currentInvoice.status === "PENDING" ? (
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
                          currentInvoice?.status === "PAID"
                            ? "green"
                            : currentInvoice?.status === "CANCELLED"
                              ? "red"
                              : currentInvoice?.status === "FAILED"
                                ? "purple"
                                : "orange"
                        }
                      >
                        {currentInvoice.status}
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
                  <Option value="PAID">PAID</Option>
                  <Option value="CANCELLED">CANCELLED</Option>
                </Select>
              </Form.Item>
              <Text
                type="secondary"
                style={{ display: "block", marginBottom: 16 }}
              >
                Lưu ý: Nếu chọn trạng thái "CANCELLED", hệ thống sẽ tự động hủy
                đơn và hoàn lại số lượng sản phẩm vào kho hàng.
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
        </div>
      </main>
    </div>
  );
};

export default AdminInvoiceList;
