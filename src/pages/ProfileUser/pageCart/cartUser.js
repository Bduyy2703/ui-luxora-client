import {
  CheckCircleOutlined,
  IssuesCloseOutlined,
  PayCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  GiftOutlined,
  CloseCircleOutlined,
  RollbackOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Pagination, Tooltip, notification } from "antd";
import { useEffect, useState } from "react";
import { defineMessages } from "react-intl";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

const statusConfig = {
  PAID: {
    display: "Đã thanh toán",
    icon: <CheckCircleOutlined className={styles.successIcon} />,
  },
  PENDING: {
    display: "Đang chờ",
    icon: <IssuesCloseOutlined className={styles.pendingIcon} />,
  },
  CONFIRMED: {
    display: "Đã xác nhận",
    icon: <ClockCircleOutlined className={styles.confirmedIcon} />,
  },
  SHIPPING: {
    display: "Đang giao hàng",
    icon: <CarOutlined className={styles.shippingIcon} />,
  },
  DELIVERED: {
    display: "Đã giao hàng",
    icon: <GiftOutlined className={styles.deliveredIcon} />,
  },
  CANCELLED: {
    display: "Đã hủy",
    icon: <CloseCircleOutlined className={styles.cancelledIcon} />,
  },
  RETURNED: {
    display: "Đã trả hàng",
    icon: <RollbackOutlined className={styles.returnedIcon} />,
  },
  FAILED: {
    display: "Thất bại",
    icon: <WarningOutlined className={styles.failedIcon} />,
  },
};

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
        status: invoice.status,
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
      <motion.div
        className={styles.profileUser}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className={styles.title}>
          <span>ĐƠN HÀNG CỦA BẠN</span>
          <span className={styles.note}>
            (Lưu ý: Bạn chỉ có thể hủy đơn trong vòng 30 phút sau khi đặt hàng)
          </span>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.orderTable}>
            <thead>
              <tr>
                <th>Đơn hàng</th>
                <th>Ngày</th>
                <th>Phương thức thanh toán</th>
                <th>Giá trị đơn hàng</th>
                <th>Trạng thái</th>
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
                  <motion.tr
                    key={order._id}
                    className={styles.orderRow}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <td
                      className={styles.orderCode}
                      onClick={() => handleInvoiceDetail(order._id)}
                      aria-label={`Xem chi tiết đơn hàng ${order.orderCode}`}
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
                      <div className={styles.statusWrapper}>
                        <span>
                          {statusConfig[order.status]?.display ||
                            "Trạng thái không xác định"}
                        </span>
                        <div className={styles.iconGroup}>
                          {statusConfig[order.status]?.icon || null}
                          {order.status === "PENDING" &&
                            order.paymentMethod === "VNPAY" && (
                              //   <Tooltip title="Thanh toán lại">
                              //     <motion.div
                              //       whileHover={{ scale: 1.1 }}
                              //       whileTap={{ scale: 0.9 }}
                              //     >
                              //       <PayCircleOutlined
                              //         className={styles.retryIcon}
                              //         onClick={() =>
                              //           handlePayment(
                              //             order._id,
                              //             order.paymentMethod,
                              //           )
                              //         }
                              //         aria-label="Thanh toán lại đơn hàng"
                              //       />
                              //     </motion.div>
                              //   </Tooltip>
                              // )}
                              <></>
                            )}  
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          current={currentPage}
          pageSize={ordersPerPage}
          total={orders.length}
          onChange={handlePageChange}
          className={styles.pagination}
          showSizeChanger={false}
        />
      </motion.div>
    </div>
  );
};

export default CartUser;
