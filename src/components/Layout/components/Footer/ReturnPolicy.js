import styles from "./ReturnPolicy.module.scss";

const ReturnPolicy = () => {
  const timelineSteps = [
    {
      title: "Bước 1: Kiểm Tra Điều Kiện Đổi Trả",
      description:
        "Sản phẩm được đổi trả trong vòng 7 ngày kể từ ngày nhận hàng. Sản phẩm phải còn nguyên vẹn, không có dấu hiệu sử dụng, và kèm theo hóa đơn mua hàng.",
    },
    {
      title: "Bước 2: Liên Hệ Với DCLux",
      description:
        "Gửi yêu cầu đổi trả qua email support@dclux.vn hoặc gọi đến số 0768800022. Vui lòng cung cấp thông tin đơn hàng và lý do đổi trả.",
    },
    {
      title: "Bước 3: Gửi Sản Phẩm Về DCLux",
      description:
        "Đóng gói sản phẩm cẩn thận và gửi về địa chỉ: 123 Đường Luxury, Quận 1, TP. Hồ Chí Minh. Khách hàng chịu phí vận chuyển nếu lỗi không phải do DCLux.",
    },
    {
      title: "Bước 4: Xử Lý Yêu Cầu",
      description:
        "DCLux sẽ kiểm tra sản phẩm trong vòng 3-5 ngày làm việc. Nếu đủ điều kiện, chúng tôi sẽ hoàn tiền hoặc đổi sản phẩm mới cho bạn.",
    },
    {
      title: "Bước 5: Nhận Kết Quả",
      description:
        "Sau khi xử lý, bạn sẽ nhận được thông báo qua email hoặc điện thoại. Sản phẩm đổi mới sẽ được gửi đến bạn miễn phí.",
      image: "https://via.placeholder.com/400x250?text=Return+Process",
    },
  ];

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Chính Sách Đổi Trả</h1>
          <p>Quy trình đổi trả dễ dàng tại DCLux</p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.timeline}>
          {timelineSteps.map((step, index) => (
            <div key={index} className={styles.timelineItem}>
              <div className={styles.timelineMarker}></div>
              <div className={styles.timelineContent}>
                <h2>{step.title}</h2>
                <p>{step.description}</p>
                {step.image && (
                  <img
                    src={step.image}
                    alt="Return Process"
                    className={styles.timelineImage}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.contact}>
          <h2>Liên Hệ Hỗ Trợ</h2>
          <p>
            Nếu bạn cần thêm thông tin về đổi trả, vui lòng liên hệ:
          </p>
          <p>
            <strong>Email:</strong> support@dclux.vn
          </p>
          <p>
            <strong>Điện thoại:</strong> 0768800022
          </p>
          <p>
            <strong>Thời gian:</strong> 9:00 - 18:00 (Thứ 2 - Thứ 7)
          </p>
        </div>
      </main>
    </div>
  );
};

export default ReturnPolicy;