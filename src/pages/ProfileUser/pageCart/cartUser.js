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
import { getProfile } from "../../../services/api/userService"; // Thêm getInvoiceById
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
      navigate("/account/orders"); // Quay lại trang danh sách nếu lỗi
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
        <span style={{ fontSize: "24px", fontWeight: "300" }}>
          ĐƠN HÀNG CỦA BẠN
        </span>
        <table
          style={{
            width: "100%",
            height: "105px",
            borderCollapse: "collapse",
            marginTop: "20px",
            border: "1px solid #ebebeb",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  width: "182px",
                  height: "35px",
                  border: "1px solid #ccc",
                  backgroundColor: "#01567f",
                  color: "white",
                }}
              >
                Đơn hàng
              </th>
              <th
                style={{
                  width: "238px",
                  height: "35px",
                  border: "1px solid #ccc",
                  backgroundColor: "#01567f",
                  color: "white",
                }}
              >
                Ngày
              </th>
              <th
                style={{
                  width: "192px",
                  height: "35px",
                  border: "1px solid #ccc",
                  backgroundColor: "#01567f",
                  color: "white",
                }}
              >
                Phương thức thanh toán
              </th>
              <th
                style={{
                  width: "188px",
                  height: "35px",
                  border: "1px solid #ccc",
                  backgroundColor: "#01567f",
                  color: "white",
                }}
              >
                Giá trị đơn hàng
              </th>
              <th
                style={{
                  width: "245px",
                  height: "35px",
                  border: "1px solid #ccc",
                  backgroundColor: "#01567f",
                  color: "white",
                }}
              >
                TT thanh toán
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    color: "#666",
                    padding: "20px",
                  }}
                >
                  Đang tải đơn hàng...
                </td>
              </tr>
            ) : currentOrders.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    color: "#666",
                    padding: "20px",
                  }}
                >
                  Không có đơn hàng nào.
                </td>
              </tr>
            ) : (
              currentOrders.map((order) => (
                <tr
                  key={order._id}
                  style={{ height: "50px", borderBottom: "1px solid #ebebeb" }}
                >
                  <td
                    style={{
                      textAlign: "center",
                      borderRight: "1px solid #ebebeb",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                    onClick={() => handleInvoiceDetail(order._id)}
                  >
                    {order.orderCode}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      borderRight: "1px solid #ebebeb",
                    }}
                  >
                    {new Date(order.purchaseDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      borderRight: "1px solid #ebebeb",
                    }}
                  >
                    {order.paymentMethod}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      borderRight: "1px solid #ebebeb",
                    }}
                  >
                    {new Intl.NumberFormat("vi-VN").format(order.amountToPay)}
                    <span className={styles.dong}>đ</span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {order.status === "success" ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        Đã thanh toán{" "}
                        <CheckCircleOutlined
                          style={{ marginLeft: "23px", color: "green" }}
                        />
                        <PayCircleOutlined
                          style={{
                            marginLeft: "30px",
                            color: "gray",
                            cursor: "not-allowed",
                          }}
                          title="Đã thanh toán"
                        />
                      </span>
                    ) : order.status === "pending" ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        Đang chờ{" "}
                        <IssuesCloseOutlined
                          style={{ marginLeft: "50px", color: "red" }}
                        />
                        <Tooltip title="Thanh toán lại">
                          <PayCircleOutlined
                            style={{
                              marginLeft: "30px",
                              color: "blue",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              handlePayment(order._id, order.paymentMethod)
                            }
                          />
                        </Tooltip>
                      </span>
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
          style={{ marginTop: "20px", textAlign: "center" }}
        />
      </div>
    </div>
  );
};

export default CartUser;
