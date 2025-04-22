import {
  CheckCircleOutlined,
  IssuesCloseOutlined,
  PayCircleOutlined,
} from "@ant-design/icons";
import { Pagination, Tooltip, notification } from "antd";
import { useEffect, useState } from "react";
import { defineMessages } from "react-intl";
import { useNavigate } from "react-router-dom";
import { retryPayment } from "../../../services/api/checkoutService";
import { getProfile } from "../../../services/api/userService";
import styles from "./CartUser.module.scss";
import {
  getInvoiceById,
  getInvoiceByUser,
} from "../../../services/api/invoiceService";

const messages = defineMessages({
  jewelryTitle: {
    id: "src.pages.Login.index.jewelry",
    defaultMessage: "Jewelry",
  },
});

const CartUser = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const ordersPerPage = 8;
  const navigate = useNavigate();

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const getAll = async () => {
    setLoading(true);
    try {
      const profile = await getProfile();
      const userId = profile?.userId;
      if (!userId) {
        throw new Error("Không tìm thấy userId");
      }

      const response = await getInvoiceByUser(userId);
      const mappedOrders = response.map((invoice) => ({
        _id: invoice.id,
        orderCode: `INV-${invoice.id}`,
        purchaseDate: invoice.createdAt,
        paymentMethod: invoice.paymentMethod,
        amountToPay: invoice.finalTotal,
        status:
          invoice.status === "PAID"
            ? "success"
            : invoice.status === "PENDING"
              ? "pending"
              : "unknown",
      }));
      setOrders(mappedOrders);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      notification.error({
        message: "Thông báo",
        description: "Không thể tải danh sách đơn hàng",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAll();
  }, []);

  const handleInvoiceDetail = async (invoiceId) => {
    try {
      const invoiceDetail = await getInvoiceById(invoiceId);
      navigate("/account/orders/invoice-detail", { state: { invoiceDetail } });
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết hóa đơn:", error);
      notification.error({
        message: "Thông báo",
        description: "Không thể tải chi tiết hóa đơn",
        duration: 3,
      });
      navigate("/account/orders");
    }
  };

  const handlePayment = async (invoiceId, paymentMethod) => {
    try {
      const result = await retryPayment({ invoiceId, paymentMethod });
      if (result?.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        console.error("Không tìm thấy paymentUrl trong phản hồi.");
        notification.error({
          message: "Thông báo",
          description: "Không thể thực hiện thanh toán lại",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Lỗi khi gọi hàm thanh toán lại:", error);
      notification.error({
        message: "Thông báo",
        description: error.response?.data?.message || "Thanh toán lại thất bại",
        duration: 3,
      });
    }
  };

  return (
    <div className={styles.profile}>
      <div className={styles.profileUser}>
        <span className={styles.title}>ĐƠN HÀNG CỦA BẠN</span>
        <table className={styles.orderTable}>
          <thead>
            <tr>
              <th>Đơn hàng</th>
              <th>Ngày</th>
              <th>Phương thức thanh toán</th>
              <th>Giá trị đơn hàng</th>
              <th>TT thanh toán</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className={styles.loadingText}>
                  Đang tải đơn hàng...
                </td>
              </tr>
            ) : currentOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.emptyText}>
                  Không có đơn hàng nào.
                </td>
              </tr>
            ) : (
              currentOrders.map((order, index) => (
                <tr
                  key={order._id}
                  className={styles.orderRow}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <td
                    className={styles.orderCode}
                    onClick={() => handleInvoiceDetail(order._id)}
                  >
                    {order.orderCode}
                  </td>
                  <td>
                    {new Date(order.purchaseDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td>{order.paymentMethod}</td>
                  <td>
                    {new Intl.NumberFormat("vi-VN").format(order.amountToPay)}
                    <span className={styles.dong}>đ</span>
                  </td>
                  <td className={styles.status}>
                    {order.status === "success" ? (
                      <div className={styles.statusWrapper}>
                        <span>Đã thanh toán</span>
                        <div className={styles.iconGroup}>
                          <CheckCircleOutlined className={styles.successIcon} />
                          <PayCircleOutlined
                            className={styles.disabledIcon}
                            title="Đã thanh toán"
                          />
                        </div>
                      </div>
                    ) : order.status === "pending" ? (
                      <div className={styles.statusWrapper}>
                        <span>Đang chờ</span>
                        <div className={styles.iconGroup}>
                          <IssuesCloseOutlined className={styles.pendingIcon} />
                          <Tooltip title="Thanh toán lại">
                            <PayCircleOutlined
                              className={styles.retryIcon}
                              onClick={() =>
                                handlePayment(order._id, order.paymentMethod)
                              }
                            />
                          </Tooltip>
                        </div>
                      </div>
                    ) : (
                      <span>Trạng thái không xác định</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination
          current={currentPage}
          pageSize={ordersPerPage}
          total={orders.length}
          onChange={handlePageChange}
          className={styles.pagination}
        />
      </div>
    </div>
  );
};

export default CartUser;
