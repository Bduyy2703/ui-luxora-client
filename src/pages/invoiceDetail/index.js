import React, { useState, useEffect } from "react";
import styles from "./invoiceDetail.module.scss";
import { getInvoiceDetail } from "../../services/api/userService";
import { Breadcrumb } from "antd";

const InvoiceDetail = () => {
  const [invoiceDetail, setInvoiceDetail] = useState(null);

  const InvoiceDetail = async () => {
    try {
      const invoiceId = localStorage.getItem("invoiceId");
      const response = await getInvoiceDetail(invoiceId);
      setInvoiceDetail(response);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết hóa đơn:", error);
    }
  };

  useEffect(() => {
    InvoiceDetail();
  }, []);

  const breadcrumbItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Đơn hàng của bạn", path: "/account/orders" },
    { label: "Chi tiết đơn hàng" },
  ];


  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className={styles.orderDetail}>
        <h1>Chi tiết đơn hàng {invoiceDetail?.invoice?.orderCode}</h1>
        <div className={styles.status}>
          <span>
            Trạng thái thanh toán:{" "}
            <span className={styles.unpaid}>
              {invoiceDetail?.invoice?.status === "success" ? (
                <span style={{ color: "green" }}>Đã thanh toán</span>
              ) : (
                <span style={{ color: "red" }}>Đang chờ</span>
              )}
            </span>
          </span>
          <span>Trạng thái vận chuyển: Đang vận chuyển</span>
          <span>
            Ngày tạo:
            {new Date(invoiceDetail?.invoice?.createdAt).toLocaleDateString(
              "vi-VN",
            )}
          </span>
        </div>
        <div className={styles.info}>
          <div>
            <h2>Địa chỉ giao hàng</h2>
            {/* <p>{invoiceDetail?.invoice?.address.name}</p> */}
            <p>Quận 1</p>

            {/* <p>Địa chỉ: {invoiceDetail?.invoice?.address.location}</p> */}
            <p>
              Số điện thoại:{" "}
              {invoiceDetail?.invoiceUser?.user_profile?.phoneNumber}
            </p>
          </div>
          <div>
            <h2>Thanh toán</h2>
            <p>{invoiceDetail?.invoice?.paymentMethod}</p>
          </div>
          <div>
            <h2>Ghi chú</h2>
            {/* <p>{invoiceDetail?.invoice?.note}</p> */}
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
            {invoiceDetail?.productDetails?.map((product, index) => (
              <tr key={index}>
                <td>
                  <p>{product.name}</p>
                </td>
                <td>
                  {new Intl.NumberFormat("vi-VN").format(product.price)}
                  <span className={styles.dong}>đ</span>
                </td>
                <td>{product.quantity}</td>
                <td>
                  {new Intl.NumberFormat("vi-VN").format(
                    product.price * product.quantity,
                  )}
                  <span className={styles.dong}>đ</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.summary}>
          <p>
            Khuyến mại:{" "}
            {new Intl.NumberFormat("vi-VN").format(
              invoiceDetail?.invoice?.discountAmount,
            )}
            <span className={styles.dong}>đ</span>
          </p>
          {/* <p>
          Phí vận chuyển:{" "}
          {new Intl.NumberFormat("vi-VN").format(
            invoiceDetail?.invoice?.shippingFee,
          )}
          <span className={styles.dong}>đ</span>
        </p> */}
          <p>
            Tổng tiền:{" "}
            <span className={styles.total}>
              {new Intl.NumberFormat("vi-VN").format(
                invoiceDetail?.invoice?.amountToPay,
              )}
              <span className={styles.dong}>đ</span>
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default InvoiceDetail;
