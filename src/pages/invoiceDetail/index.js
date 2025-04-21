import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Thêm useLocation, useNavigate
import styles from "./invoiceDetail.module.scss";
import { Breadcrumb, notification } from "antd";

const InvoiceDetail = () => {
  const [invoiceDetail, setInvoiceDetail] = useState(null);
  const location = useLocation(); // Lấy state từ navigate
  const navigate = useNavigate();

  useEffect(() => {
    const { invoiceDetail } = location.state || {};
    if (!invoiceDetail) {
      notification.error({
        message: "Thông báo",
        description: "Không tìm thấy chi tiết hóa đơn",
        duration: 3,
      });
      navigate("/account/orders"); // Quay lại nếu không có dữ liệu
      return;
    }
    setInvoiceDetail(invoiceDetail);
  }, [location, navigate]);

  const breadcrumbItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Đơn hàng của bạn", path: "/account/orders" },
    { label: "Chi tiết đơn hàng" },
  ];

  if (!invoiceDetail) {
    return <div>Đang tải...</div>;
  }

  // Tính tổng khuyến mại (productDiscount + shippingFeeDiscount)
  const totalDiscount =
    (invoiceDetail.productDiscount || 0) +
    (invoiceDetail.shippingFeeDiscount || 0);

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className={styles.orderDetail}>
        <h1>Chi tiết đơn hàng INV-{invoiceDetail.id}</h1>
        <div className={styles.status}>
          <span>
            Trạng thái thanh toán:{" "}
            <span className={styles.unpaid}>
              {invoiceDetail.status === "PAID" ? (
                <span style={{ color: "green" }}>Đã thanh toán</span>
              ) : (
                <span style={{ color: "red" }}>Đang chờ</span>
              )}
            </span>
          </span>
          <span>Trạng thái vận chuyển: Đang vận chuyển</span>
          <span>
            Ngày tạo:{" "}
            {new Date(invoiceDetail.createdAt).toLocaleDateString("vi-VN")}
          </span>
        </div>
        <div className={styles.info}>
          <div>
            <h2>Địa chỉ giao hàng</h2>
            <p>{invoiceDetail.address.street}</p>
            <p>
              {invoiceDetail.address.city}, {invoiceDetail.address.country}
            </p>
            <p>Số điện thoại: {invoiceDetail.user.phoneNumber}</p>
          </div>
          <div>
            <h2>Thanh toán</h2>
            <p>{invoiceDetail.paymentMethod}</p>
          </div>
          <div>
            <h2>Ghi chú</h2>
            <p>{invoiceDetail.note || "Không có ghi chú"}</p>
          </div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Đơn giá</th>
              <th>Số lượng</th>
              <th>Tổng</th>
            </tr>
          </thead>
          <tbody>
            {invoiceDetail.items?.map((item) => (
              <tr key={item.id}>
                <td>
                  <p>{item.productDetail.name}</p>
                </td>
                <td>
                  {new Intl.NumberFormat("vi-VN").format(item.price)}
                  <span className={styles.dong}>đ</span>
                </td>
                <td>{item.quantity}</td>
                <td>
                  {new Intl.NumberFormat("vi-VN").format(item.subtotal)}
                  <span className={styles.dong}>đ</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.summary}>
          <p>
            Khuyến mại: {new Intl.NumberFormat("vi-VN").format(totalDiscount)}
            <span className={styles.dong}>đ</span>
          </p>
          <p>
            Phí vận chuyển:{" "}
            {new Intl.NumberFormat("vi-VN").format(invoiceDetail.shippingFee)}
            <span className={styles.dong}>đ</span>
          </p>
          <p>
            Tổng tiền:{" "}
            <span className={styles.total}>
              {new Intl.NumberFormat("vi-VN").format(invoiceDetail.finalTotal)}
              <span className={styles.dong}>đ</span>
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default InvoiceDetail;
