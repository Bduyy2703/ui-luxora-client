
import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentFail = () => {
  const navigate = useNavigate();

  const handleBackToProfile = () => {
    navigate("/account/orders");
  };

  return (
    <div style={styles.container}>
      <img
        src="https://images.pexels.com/photos/3943723/pexels-photo-3943723.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        alt="Lỗi thanh toán"
        style={{ height: "600px", width: "600px" }}
      />
      <div style={styles.message}>Thanh toán không thành công. Vui lòng thử lại.</div>
      <button onClick={handleBackToProfile} style={styles.button}>
        Quay về Profile
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
  message: {
    fontSize: "24px",
    margin: "20px 0",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default PaymentFail;