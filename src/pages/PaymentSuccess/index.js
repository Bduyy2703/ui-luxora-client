
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const [result, setResult] = useState("");
  const [invoice, setInvoice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("PaymentSuccess useEffect started");

    const processPayment = async () => {
      try {
        console.log("Starting processPayment");

        // Lấy và log params
        const params = new URLSearchParams(window.location.search);
        console.log("URL search params:", window.location.search);

        const invoiceId = params.get("invoiceId");
        console.log("invoiceId:", invoiceId);

        // Kiểm tra invoiceId
        if (!invoiceId) {
          console.log("Missing invoiceId");
          setResult("Thiếu ID hóa đơn.");
          return;
        }

        // Kiểm tra invoiceId có phải số không
        const invoiceIdNum = parseInt(invoiceId);
        if (isNaN(invoiceIdNum)) {
          console.log("Invalid invoiceId (not a number):", invoiceId);
          setResult("ID hóa đơn không hợp lệ.");
          return;
        }

        // Kiểm tra accessToken
        const accessToken = localStorage.getItem("accessToken");
        console.log("accessToken:", accessToken ? "exists" : "missing");
        if (!accessToken) {
          console.log("Missing accessToken");
          setResult("Vui lòng đăng nhập lại.");
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        // Gọi API
        console.log("Calling API /api/v1/invoices/", invoiceIdNum);
        const response = await axios.get(`https://www.dclux.store/api/v1/invoices/${invoiceIdNum}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log("API response:", response.data);

        // Lưu thông tin hóa đơn
        setInvoice(response.data);

        // Kiểm tra trạng thái hóa đơn
        if (response.data.status !== "PAID") {
          console.log("Invoice status not PAID:", response.data.status);
          setResult(`Hóa đơn chưa được thanh toán. Trạng thái: ${response.data.status}`);
          setTimeout(() => navigate("/payment-fail"), 3000);
          return;
        }

        // Thành công
        console.log("Payment successful");
        setResult(`Thanh toán thành công! Hóa đơn #${invoiceId}, tổng: ${response.data.finalTotal} VNĐ`);
      } catch (error) {
        console.error("Error in processPayment:", error.message, error.response?.data);
        setResult(`Có lỗi xảy ra: ${error.message}`);
        setTimeout(() => navigate("/payment-fail"), 3000);
      }
    };

    processPayment();
  }, [navigate]);

  const handleBackToProfile = () => {
    console.log("Navigating to /account/orders");
    localStorage.removeItem("cartItems");
    navigate("/account/orders");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          padding: "24px",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {invoice && invoice.status === "PAID" ? (
          <>
            <div style={{ marginBottom: "16px" }}>
              <svg
                style={{ width: "64px", height: "64px", color: "#22c55e", margin: "0 auto" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937", marginBottom: "8px" }}>
              Thanh toán thành công!
            </h1>
            <p style={{ color: "#4b5563", marginBottom: "16px" }}>
              Cảm ơn bạn đã mua hàng. Dưới đây là thông tin hóa đơn của bạn:
            </p>
            <div style={{ textAlign: "left", marginBottom: "24px" }}>
              <p style={{ color: "#374151" }}>
                <span style={{ fontWeight: "600" }}>Mã hóa đơn:</span> #{invoice.id}
              </p>
              <p style={{ color: "#374151" }}>
                <span style={{ fontWeight: "600" }}>Tổng tiền:</span>{" "}
                {invoice.finalTotal.toLocaleString("vi-VN")} VNĐ
              </p>
              <p style={{ color: "#374151" }}>
                <span style={{ fontWeight: "600" }}>Trạng thái:</span> Đã thanh toán
              </p>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: "16px" }}>
              <svg
                style={{ width: "64px", height: "64px", color: "#ef4444", margin: "0 auto" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937", marginBottom: "8px" }}>
              Có lỗi xảy ra
            </h1>
            <p style={{ color: "#4b5563", marginBottom: "16px" }}>{result || "Vui lòng kiểm tra lại hóa đơn."}</p>
          </>
        )}
        <button
          onClick={handleBackToProfile}
          style={{
            backgroundColor: "#3b82f6",
            color: "#ffffff",
            padding: "8px 24px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
        >
          Quay về Profile
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;