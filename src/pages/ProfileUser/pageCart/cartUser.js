import {
  CheckCircleOutlined,
  IssuesCloseOutlined,
  PayCircleOutlined,
} from "@ant-design/icons";
import { Pagination, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { defineMessages } from "react-intl";
import { useNavigate } from "react-router-dom";
import { retryPayment } from "../../../services/api/checkoutService";
import { getAllInvoices } from "../../../services/api/userService";
import styles from "./CartUser.module.scss";

const messages = defineMessages({
  jewelryTitle: {
    id: "src.pages.Login.index.jewelry",
    defaultMessage: "Jewelry",
  },
});

const CartUser = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  // const location = useLocation();
  // const { cartItems, emailtoken, paymentData } = location.state || {};
  // const paymentDataArray = Object.values(paymentData);
  const ordersPerPage = 8;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const navigate = useNavigate();

  const getAll = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await getAllInvoices(userId);
      setOrders(response);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    }
  };

  useEffect(() => {
    getAll();
  }, []);

  const handleInvoiceDetail = (invoiceId) => {
    localStorage.setItem("invoiceId", invoiceId);
    window.location.href = "/account/orders/invoice-detail";
  };

  const handlePayment = async (invoiceId) => {
    try {
      const result = await retryPayment({ invoiceId });
      
      if (result.error) {
        console.error("Lỗi khi thanh toán lại:", result.error);
      } else {
        if (result?.data?.paymentUrl) {
          window.location.href = result?.data?.paymentUrl; 
        } else {
          console.error("Không tìm thấy paymentUrl trong phản hồi.");
        }
      }
    } catch (error) {
      console.error("Lỗi khi gọi hàm thanh toán lại:", error);
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
            {currentOrders.length === 0 ? (
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
              currentOrders.map((order, index) => (
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
                    {/* {order.purchaseDate} */}
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
                            onClick={() => handlePayment(order._id)}
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
    // </PageWrapper>
  );
};

export default CartUser;
