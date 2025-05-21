import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Breadcrumb, notification, Tooltip } from "antd";
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
import {
  retryPayment,
  cancelPayment,
} from "../../services/api/checkoutService";
import styles from "./invoiceDetail.module.scss";

const statusTimeline = [
  {
    status: "PENDING",
    display: "Đang chờ",
    icon: <IssuesCloseOutlined />,
  },
  {
    status: "CONFIRMED",
    display: "Đã xác nhận",
    icon: <ClockCircleOutlined />,
  },
  {
    status: "SHIPPING",
    display: "Đang giao hàng",
    icon: <CarOutlined />,
  },
  {
    status: "DELIVERED",
    display: "Đã giao hàng",
    icon: <GiftOutlined />,
  },
  {
    status: "RETURNED",
    display: "Đã trả hàng",
    icon: <RollbackOutlined />,
  },
  {
    status: "CANCELLED",
    display: "Đã hủy",
    icon: <CloseCircleOutlined />,
  },
  {
    status: "FAILED",
    display: "Thất bại",
    icon: <WarningOutlined />,
  },
  {
    status: "PAID",
    display: "Đã thanh toán",
    icon: <CheckCircleOutlined />,
  },
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

const InvoiceDetail = () => {
  const [invoiceDetail, setInvoiceDetail] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isCancelDisabled, setIsCancelDisabled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { invoiceDetail } = location.state || {};
    if (!invoiceDetail) {
      navigate("/account/orders");
      return;
    }
    setInvoiceDetail(invoiceDetail);

    const createdAt = new Date(invoiceDetail.createdAt).getTime();
    const now = new Date().getTime();
    const thirtyMinutes = 30 * 60 * 1000;
    if (now - createdAt > thirtyMinutes) {
      setIsCancelDisabled(true);
    }
  }, [location, navigate]);

  const handlePayment = async (invoiceId, paymentMethod) => {
    setPaymentLoading(true);
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
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCancel = async (invoiceId) => {
    setCancelLoading(true);
    try {
      await cancelPayment(invoiceId);
      notification.success({
        message: "Thông báo",
        description: "Hủy hóa đơn thành công",
        duration: 3,
      });
      navigate("/account/orders");
    } catch (error) {
      console.error("Lỗi khi hủy hóa đơn:", error);
      notification.error({
        message: "Thông báo",
        description: error.response?.data?.message || "Hủy hóa đơn thất bại",
        duration: 3,
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const currentStatusIndex = statusTimeline.findIndex(
    (item) => item.status === invoiceDetail?.status,
  );

  const getValidNextStatuses = (currentStatus) => {
    return validTransitions[currentStatus] || [];
  };

  const isMainFlowStatus = (status) => {
    return ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "PAID"].includes(
      status,
    );
  };

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
      <div className={styles.header}>
        <div className={styles.logo}>Jewelry Co.</div>
        <h1 className={styles.title}>
          Chi tiết đơn hàng INV-{invoiceDetail.id}
        </h1>
      </div>
      <Breadcrumb items={breadcrumbItems} className={styles.breadcrumb} />
      <div className={styles.orderDetail}>
        <div className={styles.timeline}>
          {invoiceDetail.status === "CANCELLED" ||
          invoiceDetail.status === "RETURNED"
            ? // Chỉ hiển thị trạng thái CANCELLED hoặc RETURNED
              (() => {
                const step = statusTimeline.find(
                  (s) => s.status === invoiceDetail.status,
                );
                return (
                  <div
                    key={step.status}
                    className={`${styles.timelineStep} ${styles.active}`}
                  >
                    <div className={styles.timelineIcon}>{step.icon}</div>
                    <div className={styles.timelineLabel}>{step.display}</div>
                  </div>
                );
              })()
            : // Hiển thị timeline đầy đủ cho các trạng thái khác
              statusTimeline.map((step, index) => {
                const isActive =
                  index <= currentStatusIndex && isMainFlowStatus(step.status);
                const isLastStep = index === statusTimeline.length - 1;
                const isException = [
                  "CANCELLED",
                  "FAILED",
                  "RETURNED",
                ].includes(step.status);
                const validNextStatuses = getValidNextStatuses(
                  invoiceDetail.status,
                );
                const shouldDisplay =
                  (isMainFlowStatus(step.status) &&
                    index <= currentStatusIndex) ||
                  (isException &&
                    (step.status === invoiceDetail.status ||
                      validNextStatuses.includes(step.status)));

                return shouldDisplay ? (
                  <div
                    key={step.status}
                    className={`${styles.timelineStep} ${isActive ? styles.active : ""}`}
                  >
                    <div className={styles.timelineIcon}>{step.icon}</div>
                    <div className={styles.timelineLabel}>{step.display}</div>
                    {!isLastStep &&
                      !isException &&
                      isMainFlowStatus(step.status) && (
                        <div className={styles.timelineArrow}>→</div>
                      )}
                  </div>
                ) : null;
              })}
        </div>

        <div className={styles.status}>
          <div className={styles.statusItem}>
            <span>Trạng thái thanh toán: </span>
            <span
              className={
                invoiceDetail.status === "PAID"
                  ? styles.paid
                  : invoiceDetail.status === "PENDING"
                    ? styles.pending
                    : styles.confirmed
              }
            >
              {invoiceDetail.status === "PAID"
                ? "Đã thanh toán"
                : invoiceDetail.status === "PENDING"
                  ? "Đang chờ"
                  : "Đã xác nhận"}
            </span>
            {(invoiceDetail.status === "PENDING" ||
              invoiceDetail.status === "CONFIRMED") && (
              <div className={styles.actionButtons}>
                {invoiceDetail.status === "PENDING" &&
                  invoiceDetail.paymentMethod === "VNPAY" && (
                    <Tooltip title="Thử thanh toán lại bằng VNPAY">
                      <div
                        className={`${styles.retryIcon} ${
                          paymentLoading ? styles.disabledIcon : ""
                        }`}
                        onClick={() =>
                          !paymentLoading &&
                          handlePayment(
                            invoiceDetail.id,
                            invoiceDetail.paymentMethod,
                          )
                        }
                      >
                        Thanh toán lại
                      </div>
                    </Tooltip>
                  )}
                <Tooltip
                  title={
                    isCancelDisabled
                      ? "Không thể hủy sau 30 phút kể từ khi tạo"
                      : "Hủy hóa đơn"
                  }
                >
                  <div
                    className={`${styles.cancelIcon} ${
                      cancelLoading || isCancelDisabled
                        ? styles.disabledIcon
                        : ""
                    }`}
                    onClick={() =>
                      !cancelLoading &&
                      !isCancelDisabled &&
                      handleCancel(invoiceDetail.id)
                    }
                  >
                    Hủy hóa đơn
                  </div>
                </Tooltip>
              </div>
            )}
          </div>
          <div className={styles.statusItem}>
            <span>Ngày tạo: </span>
            <span>
              {new Date(invoiceDetail.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span>Ngày cập nhật: </span>
            <span>
              {new Date(invoiceDetail.updatedAt).toLocaleDateString("vi-VN")}
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
        {invoiceDetail.discount?.length > 0 && (
          <div className={styles.discountSection}>
            <h2>Chi tiết khuyến mại</h2>
            <div className={styles.discountList}>
              {invoiceDetail.discount.map((disc, index) => (
                <div key={disc.id} className={styles.discountItem}>
                  <p>
                    <span>Mã giảm giá: </span>
                    <span className={styles.discountCode}>
                      {disc.discount.name}
                    </span>
                  </p>
                  <p>
                    <span>Loại: </span>
                    {disc.discount.discountType === "PERCENTAGE"
                      ? "Giảm theo phần trăm"
                      : "Giảm số tiền cố định"}
                  </p>
                  <p>
                    <span>Giá trị: </span>
                    {disc.discount.discountType === "PERCENTAGE"
                      ? `${disc.discount.discountValue}%`
                      : `${new Intl.NumberFormat("vi-VN").format(
                          disc.discount.discountValue,
                        )}đ`}
                  </p>
                  <p>
                    <span>Áp dụng cho: </span>
                    {disc.discount.condition === "SHIPPING"
                      ? "Phí vận chuyển"
                      : "Tổng hóa đơn"}
                  </p>
                  <p>
                    <span>Thời gian áp dụng: </span>
                    {new Date(disc.discount.startDate).toLocaleDateString(
                      "vi-VN",
                    )}{" "}
                    -{" "}
                    {new Date(disc.discount.endDate).toLocaleDateString(
                      "vi-VN",
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className={styles.summary}>
          <p>
            Tổng sản phẩm:{" "}
            {new Intl.NumberFormat("vi-VN").format(
              invoiceDetail.totalProductAmount,
            )}
            <span className={styles.dong}>đ</span>
          </p>
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
