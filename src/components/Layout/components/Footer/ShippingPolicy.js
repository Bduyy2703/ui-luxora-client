import styles from "./ShippingPolicy.module.scss";

const ShippingPolicy = () => {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Chính Sách Vận Chuyển</h1>
          <p>Giao hàng nhanh chóng và an toàn từ DCLux</p>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2>1. Phạm Vi Giao Hàng</h2>
          <p>
            DCLux hỗ trợ giao hàng trên toàn quốc, bao gồm cả khu vực nội thành và ngoại tỉnh. Chúng tôi hợp tác với các đơn vị vận chuyển uy tín để đảm bảo sản phẩm được giao đến tay bạn an toàn.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Thời Gian Giao Hàng</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Khu Vực</th>
                <th>Thời Gian Giao Hàng</th>
                <th>Phí Vận Chuyển</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>TP. Hồ Chí Minh</td>
                <td>1-2 ngày làm việc</td>
                <td>Miễn phí cho đơn hàng từ 5.000.000 VNĐ</td>
              </tr>
              <tr>
                <td>Hà Nội</td>
                <td>2-3 ngày làm việc</td>
                <td>Miễn phí cho đơn hàng từ 5.000.000 VNĐ</td>
              </tr>
              <tr>
                <td>Các tỉnh khác</td>
                <td>3-5 ngày làm việc</td>
                <td>50.000 VNĐ (miễn phí cho đơn từ 5.000.000 VNĐ)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className={styles.section}>
          <h2>3. Quy Trình Giao Hàng</h2>
          <p>
            Sau khi đơn hàng được xác nhận, DCLux sẽ đóng gói sản phẩm cẩn thận trong hộp quà sang trọng và giao cho đơn vị vận chuyển. Bạn sẽ nhận được mã vận đơn để theo dõi trạng thái giao hàng.
          </p>
          <img
            src="https://via.placeholder.com/800x400?text=Shipping+Process"
            alt="Shipping Process"
            className={styles.sectionImage}
          />
        </section>

        <section className={styles.section}>
          <h2>4. Lưu Ý Khi Nhận Hàng</h2>
          <p>
            Vui lòng kiểm tra kỹ sản phẩm khi nhận hàng. Nếu có bất kỳ hư hỏng nào do vận chuyển, hãy liên hệ với chúng tôi ngay trong vòng 24 giờ để được hỗ trợ.
          </p>
        </section>

        <div className={styles.contact}>
          <h2>Liên Hệ Hỗ Trợ</h2>
          <p>
            Nếu bạn cần thêm thông tin về vận chuyển, vui lòng liên hệ:
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

export default ShippingPolicy;