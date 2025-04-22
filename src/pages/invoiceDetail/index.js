import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./invoiceDetail.module.scss";
import { Breadcrumb, notification } from "antd";

const InvoiceDetail = () => {
  const [invoiceDetail, setInvoiceDetail] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { invoiceDetail } = location.state || {};
    if (!invoiceDetail) {
      notification.error({
        message: "Thông báo",
        description: "Không tìm thấy chi tiết hóa đơn",
        duration: 3,
      });
      navigate("/account/orders");
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
    return <div className={styles.loading}>Đang tải...</div>;
  }

  const totalDiscount =
    (invoiceDetail.productDiscount || 0) +
    (invoiceDetail.shippingFeeDiscount || 0);

  return (
    <div className={styles.wrapper}>
      <Breadcrumb items={breadcrumbItems} className={styles.breadcrumb} />
      <div className={styles.orderDetail}>
        <h1 className={styles.title}>
          Chi tiết đơn hàng INV-{invoiceDetail.id}
        </h1>
        <div className={styles.status}>
          <div className={styles.statusItem}>
            <span>Trạng thái thanh toán: </span>
            <span
              className={
                invoiceDetail.status === "PAID" ? styles.paid : styles.unpaid
              }
            >
              {invoiceDetail.status === "PAID" ? "Đã thanh toán" : "Đang chờ"}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span>Trạng thái vận chuyển: </span>
            <span>Đang vận chuyển</span>
          </div>
          <div className={styles.statusItem}>
            <span>Ngày tạo: </span>
            <span>
              {new Date(invoiceDetail.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>
        <div className={styles.info}>
          <div className={styles.infoBlock}>
            <h2>Địa chỉ giao hàng</h2>
            <p>{invoiceDetail.address.street}</p>
            <p>
              {invoiceDetail.address.city}, {invoiceDetail.address.country}
            </p>
            <p>Số điện thoại: {invoiceDetail.user.phoneNumber}</p>
          </div>
          <div className={styles.infoBlock}>
            <h2>Thanh toán</h2>
            <p>{invoiceDetail.paymentMethod}</p>
          </div>
          <div className={styles.infoBlock}>
            <h2>Ghi chú</h2>
            <p>{invoiceDetail.note || "Không có ghi chú"}</p>
          </div>
        </div>
        <div className={styles.tableWrapper}>
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
              {invoiceDetail.items?.map((item, index) => (
                <tr
                  key={item.id}
                  className={styles.tableRow}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <td>{item.productDetail.name}</td>
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
        </div>
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
    </div>
  );
};

export default InvoiceDetail;
