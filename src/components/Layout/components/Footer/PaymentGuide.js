import { motion } from "framer-motion";
import styles from "./PaymentGuide.module.scss";

const PaymentGuide = () => {
  const stepsCOD = [
    {
      step: "Bước 1: Đặt Hàng",
      description:
        "Chọn sản phẩm yêu thích tại DCLux và thêm vào giỏ hàng. Sau đó, vào giỏ hàng và chọn phương thức thanh toán COD (Thanh toán khi nhận hàng).",
    },
    {
      step: "Bước 2: Xác Nhận Đơn Hàng",
      description:
        "Điền thông tin giao hàng (họ tên, địa chỉ, số điện thoại). DCLux sẽ gửi email hoặc tin nhắn xác nhận đơn hàng cho bạn.",
    },
    {
      step: "Bước 3: Nhận Hàng và Thanh Toán",
      description:
        "Khi nhận hàng, kiểm tra sản phẩm và thanh toán bằng tiền mặt cho nhân viên giao hàng. Đảm bảo bạn đã chuẩn bị đủ số tiền cần thiết.",
    },
  ];

  const stepsVNPay = [
    {
      step: "Bước 1: Chọn Phương Thức VNPay",
      description:
        "Sau khi thêm sản phẩm vào giỏ hàng, vào phần thanh toán và chọn VNPay làm phương thức thanh toán.",
    },
    {
      step: "Bước 2: Chuyển Hướng Đến VNPay",
      description:
        "Hệ thống sẽ chuyển bạn đến trang thanh toán của VNPay. Đăng nhập vào tài khoản VNPay của bạn hoặc quét mã QR qua ứng dụng ngân hàng.",
    },
    {
      step: "Bước 3: Xác Nhận Thanh Toán",
      description:
        "Sau khi thanh toán thành công, bạn sẽ nhận được thông báo từ VNPay và email xác nhận từ DCLux. Đơn hàng sẽ được xử lý ngay sau đó.",
    },
  ];

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Hướng Dẫn Thanh Toán</h1>
          <p>Hướng dẫn chi tiết cho phương thức COD và VNPay tại DCLux</p>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.paymentMethod}>
          <h2>Phương Thức Thanh Toán: COD</h2>
          <div className={styles.steps}>
            {stepsCOD.map((step, index) => (
              <motion.div
                key={index}
                className={styles.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
              >
                <div className={styles.stepNumber}>{index + 1}</div>
                <div className={styles.stepContent}>
                  <h3>{step.step}</h3>
                  <p>{step.description}</p>
                </div>
                {index < stepsCOD.length - 1 && (
                  <div className={styles.stepConnector}></div>
                )}
              </motion.div>
            ))}
          </div>
          <img
            src="https://via.placeholder.com/800x400?text=COD+Payment"
            alt="COD Payment"
            className={styles.sectionImage}
          />
        </section>

        <section className={styles.paymentMethod}>
          <h2>Phương Thức Thanh Toán: VNPay</h2>
          <div className={styles.steps}>
            {stepsVNPay.map((step, index) => (
              <motion.div
                key={index}
                className={styles.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
              >
                <div className={styles.stepNumber}>{index + 1}</div>
                <div className={styles.stepContent}>
                  <h3>{step.step}</h3>
                  <p>{step.description}</p>
                </div>
                {index < stepsVNPay.length - 1 && (
                  <div className={styles.stepConnector}></div>
                )}
              </motion.div>
            ))}
          </div>
          <img
            src="https://via.placeholder.com/800x400?text=VNPay+Payment"
            alt="VNPay Payment"
            className={styles.sectionImage}
          />
        </section>

        <section className={styles.contact}>
          <h2>Hỗ Trợ Thanh Toán</h2>
          <p>
            Nếu gặp bất kỳ vấn đề nào trong quá trình thanh toán, vui lòng liên
            hệ với DCLux qua:
          </p>
          <p>
            <strong>Email:</strong> support@dclux.vn
          </p>
          <p>
            <strong>Điện thoại:</strong> 0768800022
          </p>
          <p>
            <strong>Thời gian hỗ trợ:</strong> 9:00 - 18:00 (Thứ 2 - Thứ 7)
          </p>
        </section>
      </main>
    </div>
  );
};

export default PaymentGuide;
