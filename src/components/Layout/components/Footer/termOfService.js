import styles from "./termOfService.module.scss";
import logo from "../../../../assets/icon/5a8938c2b4e337f6e2f9b0e83dcec095.jpg";

const TermsOfService = () => {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Điều Khoản Dịch Vụ</h1>
          <p style={{ color: "black" }}>
            Các điều khoản sử dụng dịch vụ tại DCLux
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2>1. Chào Mừng Đến Với DCLux</h2>
          <p>
            Chào mừng quý khách đến với DCLux - thương hiệu trang sức cao cấp
            hàng đầu. Khi sử dụng dịch vụ của chúng tôi, quý khách đồng ý tuân
            thủ các điều khoản và điều kiện được nêu trong tài liệu này. Vui
            lòng đọc kỹ trước khi sử dụng bất kỳ dịch vụ nào của DCLux.
          </p>
          <img
            src={logo}
            alt="Luxury Jewelry"
            className={styles.sectionImage}
          />
        </section>

        <section className={styles.section}>
          <h2>2. Quyền và Nghĩa Vụ của Khách Hàng</h2>
          <p>
            Khách hàng có quyền truy cập và mua sắm các sản phẩm cao cấp tại
            DCLux. Tuy nhiên, quý khách cần đảm bảo rằng mọi thông tin cung cấp
            (họ tên, địa chỉ, số điện thoại, email) là chính xác và hợp pháp.
            DCLux không chịu trách nhiệm nếu thông tin khách hàng cung cấp không
            đúng.
          </p>
          <ul>
            <li>Đảm bảo thanh toán đầy đủ và đúng hạn cho các đơn hàng.</li>
            <li>
              Không sử dụng sản phẩm của DCLux vào các mục đích bất hợp pháp.
            </li>
            <li>Tôn trọng bản quyền và thương hiệu của DCLux.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Chính Sách Đặt Hàng và Thanh Toán</h2>
          <p>
            DCLux cung cấp nhiều phương thức thanh toán an toàn bao gồm thẻ tín
            dụng, chuyển khoản ngân hàng, và thanh toán khi nhận hàng (COD). Tất
            cả các đơn hàng cần được xác nhận qua email hoặc số điện thoại trước
            khi được xử lý. Quý khách vui lòng kiểm tra kỹ thông tin đơn hàng
            trước khi xác nhận.
          </p>
          <p>
            Trong trường hợp hủy đơn hàng, vui lòng liên hệ với chúng tôi trong
            vòng 24 giờ kể từ khi đặt hàng để được hỗ trợ.
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. Bảo Mật Thông Tin</h2>
          <p>
            DCLux cam kết bảo mật thông tin cá nhân của khách hàng theo chính
            sách bảo mật của chúng tôi. Mọi thông tin cá nhân sẽ không được chia
            sẻ với bên thứ ba mà không có sự đồng ý của quý khách, trừ khi có
            yêu cầu từ cơ quan pháp luật.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Trách Nhiệm của DCLux</h2>
          <p>
            DCLux cam kết cung cấp các sản phẩm trang sức cao cấp đúng như mô tả
            trên website. Chúng tôi đảm bảo chất lượng sản phẩm và hỗ trợ khách
            hàng trong mọi trường hợp liên quan đến bảo hành, đổi trả theo chính
            sách đã công bố.
          </p>
          <img
            src="https://cdn.hpdecor.vn/wp-content/uploads/2021/11/thiet-ke-cua-hang-vang-bac-1.jpg"
            alt="Customer Service"
            className={styles.sectionImage}
          />
        </section>

        <section className={styles.section}>
          <h2>6. Điều Khoản Sửa Đổi</h2>
          <p>
            DCLux có quyền sửa đổi các điều khoản này bất kỳ lúc nào. Các thay
            đổi sẽ được thông báo trên website chính thức của chúng tôi và có
            hiệu lực ngay sau khi đăng tải. Quý khách nên thường xuyên kiểm tra
            để cập nhật các thay đổi mới nhất.
          </p>
        </section>

        <section className={styles.contact}>
          <h2>Liên Hệ Với Chúng Tôi</h2>
          <p>
            Nếu có bất kỳ thắc mắc nào về điều khoản dịch vụ, quý khách vui lòng
            liên hệ với DCLux qua:
          </p>
          <p>
            <strong>Email:</strong> support@dclux.vn
          </p>
          <p>
            <strong>Điện thoại:</strong> 0768800022
          </p>
          <p>
            <strong>Địa chỉ:</strong> 123 Đường Luxury, Quận 1, TP. Hồ Chí Minh
          </p>
        </section>
      </main>
    </div>
  );
};

export default TermsOfService;
