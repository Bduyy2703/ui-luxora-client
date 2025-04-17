import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const [result, setResult] = useState("");

  useEffect(() => {
    const processPayment = async () => {
      const params = new URLSearchParams(window.location.search);

      const paymentParams = [
        "vnp_Amount",
        "vnp_BankCode",
        "vnp_BankTranNo",
        "vnp_CardType",
        "vnp_OrderInfo",
        "vnp_PayDate",
        "vnp_ResponseCode",
        "vnp_TmnCode",
        "vnp_TransactionNo",
        "vnp_TransactionStatus",
        "vnp_TxnRef",
        "vnp_SecureHash",
      ];

      const paymentData = {};
      paymentParams.forEach((param) => {
        paymentData[param] = params.get(param);
      });

      const { vnp_TxnRef, vnp_ResponseCode, vnp_SecureHash, vnp_Amount } =
        paymentData;

      if (vnp_TxnRef && vnp_ResponseCode && vnp_SecureHash && vnp_Amount) {
        try {
          const response = await axios.get(
            `http://35.247.185.8/api/vnpay/vnpay_ipn`,
            {
              params: paymentData,
            },
          );

          localStorage.setItem("userId", response.data.invoice.user);

          setResult(JSON.stringify(response.data));
        } catch (error) {
          setResult(`Có lỗi xảy ra khi xử lý thanh toán: ${error.message}`);
        }
      } else {
        setResult("Không có thông tin thanh toán.");
      }
    };

    processPayment();
  }, []);
  const navigate = useNavigate();

  const handleBackToProfile = () => {
    localStorage.removeItem("cartItems");
    navigate("/account/orders");
  };

  return (
    <div style={styles.container}>
      <img
        // src="https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/183547/Originals/viet-thu-cam-on-khach-hang-Shopee-5.jpg"
        src={
          "https://images.pexels.com/photos/2740956/pexels-photo-2740956.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        }
        alt="Cảm ơn"
        style={{ height: "600px", width: "600px" }}
      />
      <div style={styles.message}>Cảm ơn bạn đã mua hàng thành công</div>
      <button onClick={handleBackToProfile} style={styles.button}>
        Quay về Profile xem hóa đơn
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f0f0f0",
    textAlign: "center",
  },
  image: {
    maxWidth: "100%",
    height: "auto",
  },
  message: {
    fontSize: "24px",
    margin: "20px 0",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default PaymentSuccess;
