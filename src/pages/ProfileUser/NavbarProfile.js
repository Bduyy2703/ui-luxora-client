import { Link, useNavigate } from "react-router-dom";
import styles from "./NavbarProfile.module.scss";
import classNames from "classnames";
import { jwtDecode } from "jwt-decode";

function NavbarProfile({ className }) {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");
  const decodedToken = localStorage.getItem("decodedToken");

  const isTokenValid = () => {
    if (!accessToken) return false;
    try {
      const decoded = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  if (!isTokenValid()) {
    // localStorage.clear();
    navigate("/login"); 
  }

  return (
    <div className={classNames(styles.wrapper, className)}>
      <div className={styles.profileButton}>
        {accessToken ? (
          <>
            <span className={styles.account}>TRANG TÀI KHOẢN</span>
            <p className={styles.welcome}>
              {/* Xin chào, <span>Huy Cường!</span> */}
            </p>
            <Link to="/account">
              <div className={styles.profile}>Thông tin tài khoản</div>
            </Link>
            <Link to="/account/orders">
              <div className={styles.profile}>Đơn hàng của bạn</div>
            </Link>
            <Link to="/account/changepassword">
              <div className={styles.profile}>Đổi mật khẩu</div>
            </Link>
            <Link to="/account/addresses">
              <div className={styles.profile}>Sổ địa chỉ</div>
            </Link>
          </>
        ) : (
          <div className={styles.loginPrompt}></div>
        )}
      </div>
    </div>
  );
}

export default NavbarProfile;
