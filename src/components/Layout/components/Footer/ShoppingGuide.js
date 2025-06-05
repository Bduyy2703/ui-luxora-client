import styles from "./ShoppingGuide.module.scss";

const ShoppingGuide = () => {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Hướng Dẫn Mua Hàng</h1>
          <p>Khám phá cách mua sắm dễ dàng tại DCLux</p>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2>1. Truy Cập và Tìm Kiếm Sản Phẩm</h2>
          <p>
            Bắt đầu hành trình mua sắm của bạn tại DCLux bằng cách truy cập
            trang chủ của chúng tôi. Sử dụng thanh tìm kiếm hoặc menu danh mục
            để khám phá các bộ sưu tập trang sức cao cấp như nhẫn, vòng cổ, và
            bông tai.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Chọn Sản Phẩm và Thêm Vào Giỏ Hàng</h2>
          <p>
            Khi tìm thấy sản phẩm ưng ý, nhấp vào để xem chi tiết. Kiểm tra kích
            thước, chất liệu (vàng 18K, kim cương tự nhiên, v.v.) và nhấp nút
            "Thêm vào giỏ hàng". Bạn có thể tiếp tục mua sắm hoặc chuyển đến giỏ
            hàng để thanh toán.
          </p>
          <ul>
            <li>Xem kỹ thông tin sản phẩm trước khi thêm.</li>
            <li>Đảm bảo chọn đúng kích cỡ hoặc tùy chỉnh nếu có.</li>
            <li>Có thể lưu sản phẩm yêu thích bằng danh sách yêu thích.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Thanh Toán và Xác Nhận Đơn Hàng</h2>
          <p>
            Vào giỏ hàng, kiểm tra lại sản phẩm và nhấp "Thanh toán". Điền thông
            tin giao hàng và chọn phương thức thanh toán (thẻ tín dụng, chuyển
            khoản, COD). Sau khi xác nhận, bạn sẽ nhận được email hoặc tin nhắn
            xác nhận từ DCLux.
          </p>
          <img
            src="https://via.placeholder.com/800x400?text=Checkout+Process"
            alt="Checkout Process"
            className={styles.sectionImage}
          />
        </section>

        <section className={styles.section}>
          <h2>4. Theo Dõi Đơn Hàng</h2>
          <p>
            Sau khi đặt hàng, bạn có thể theo dõi trạng thái đơn hàng qua tài
            khoản DCLux hoặc liên hệ với chúng tôi. Thời gian giao hàng thường
            từ 2-5 ngày làm việc tùy khu vực.
          </p>
        </section>

        <section className={styles.contact}>
          <h2>Hỗ Trợ Mua Hàng</h2>
          <p>Nếu cần hỗ trợ, vui lòng liên hệ với đội ngũ DCLux qua:</p>
          <p>
            <strong>Email:</strong> support@dclux.vn
          </p>
          <p>
            <strong>Điện thoại:</strong> 0768800022
          </p>
          <p>
            <strong>Thời gian làm việc:</strong> 9:00 - 18:00 (Thứ 2 - Thứ 7)
          </p>
        </section>
      </main>
    </div>
  );
};

export default ShoppingGuide;
