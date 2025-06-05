import styles from "./PrivacyPolicy.module.scss";

const PrivacyPolicy = () => {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Chính Sách Bảo Mật</h1>
          <p>Bảo vệ thông tin cá nhân của bạn tại DCLux</p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.cards}>
          <div className={styles.card}>
            <h2>1. Thu Thập Thông Tin</h2>
            <p>
              DCLux thu thập thông tin cá nhân như họ tên, địa chỉ, số điện
              thoại, và email khi bạn đăng ký tài khoản hoặc đặt hàng. Thông tin
              này được sử dụng để xử lý đơn hàng và cung cấp dịch vụ tốt nhất.
            </p>
          </div>

          <div className={styles.card}>
            <h2>2. Sử Dụng Thông Tin</h2>
            <p>
              Thông tin của bạn được sử dụng để cá nhân hóa trải nghiệm mua sắm,
              gửi thông báo về đơn hàng, và cung cấp ưu đãi đặc biệt từ DCLux.
              Chúng tôi cam kết không sử dụng dữ liệu vào mục đích không được
              cho phép.
            </p>
          </div>

          <div className={styles.card}>
            <h2>3. Bảo Mật Dữ Liệu</h2>
            <p>
              DCLux sử dụng công nghệ mã hóa SSL để bảo vệ thông tin cá nhân của
              bạn. Dữ liệu được lưu trữ trên máy chủ an toàn và chỉ được truy
              cập bởi nhân viên được ủy quyền.
            </p>
          </div>

          <div className={styles.card}>
            <h2>4. Chia Sẻ Thông Tin</h2>
            <p>
              Chúng tôi không chia sẻ thông tin cá nhân với bên thứ ba trừ khi
              có sự đồng ý của bạn hoặc theo yêu cầu pháp luật. Các đối tác vận
              chuyển chỉ nhận thông tin cần thiết để giao hàng.
            </p>
          </div>

          <div className={styles.card}>
            <h2>5. Quyền của Bạn</h2>
            <p>
              Bạn có quyền truy cập, chỉnh sửa, hoặc xóa thông tin cá nhân của
              mình bằng cách liên hệ với chúng tôi. DCLux tôn trọng quyền riêng
              tư và sẽ hỗ trợ bạn trong mọi trường hợp.
            </p>
          </div>

          <div className={styles.card}>
            <h2>6. Chính Sách Cookie</h2>
            <p>
              DCLux sử dụng cookie để cải thiện trải nghiệm người dùng. Bạn có
              thể tắt cookie trong trình duyệt nếu không muốn tham gia, nhưng
              điều này có thể ảnh hưởng đến một số tính năng của website.
            </p>
          </div>

          <div className={styles.contact}>
            <h2>Liên Hệ Hỗ Trợ</h2>
            <p>Nếu bạn có thắc mắc về chính sách bảo mật, vui lòng liên hệ:</p>
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
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;