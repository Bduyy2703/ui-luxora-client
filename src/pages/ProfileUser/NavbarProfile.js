import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "./NavbarProfile.module.scss";
import classNames from "classnames";
import { jwtDecode } from "jwt-decode";
import {
  UserOutlined,
  ShoppingCartOutlined,
  LockOutlined,
  EnvironmentOutlined,
  HeartFilled,
} from "@ant-design/icons";
import { motion } from "framer-motion";

function NavbarProfile({ className }) {
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = localStorage.getItem("accessToken");

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
    navigate("/login");
  }

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/account") return "account";
    if (path === "/account/orders") return "orders";
    if (path === "/account/changepassword") return "changepassword";
    if (path === "/account/addresses") return "addresses";
    if (path === "/account/wishlist") return "wishlist";
    return "";
  };

  const activeTab = getActiveTab();

  return (
    <motion.div
      className={classNames(styles.wrapper, className)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className={styles.profileButton}>
        {accessToken ? (
          <>
            <span className={styles.account}>TRANG TÀI KHOẢN</span>
            <ul className={styles.navList}>
              <li>
                <Link
                  to="/account"
                  className={classNames({
                    [styles.active]: activeTab === "account",
                  })}
                  aria-label="Thông tin tài khoản"
                >
                  <UserOutlined
                    className={classNames(styles.icon, {
                      [styles.activeIcon]: activeTab === "account",
                    })}
                  />
                  Thông tin tài khoản
                </Link>
              </li>
              <li>
                <Link
                  to="/account/changepassword"
                  className={classNames({
                    [styles.active]: activeTab === "changepassword",
                  })}
                  aria-label="Đổi mật khẩu"
                >
                  <LockOutlined
                    className={classNames(styles.icon, {
                      [styles.activeIcon]: activeTab === "changepassword",
                    })}
                  />
                  Đổi mật khẩu
                </Link>
              </li>
              <li>
                <Link
                  to="/account/addresses"
                  className={classNames({
                    [styles.active]: activeTab === "addresses",
                  })}
                  aria-label="Sổ địa chỉ"
                >
                  <EnvironmentOutlined
                    className={classNames(styles.icon, {
                      [styles.activeIcon]: activeTab === "addresses",
                    })}
                  />
                  Sổ địa chỉ
                </Link>
              </li>
              <li>
                <Link
                  to="/account/wishlist"
                  className={classNames({
                    [styles.active]: activeTab === "wishlist",
                  })}
                  aria-label="Sản phẩm yêu thích"
                >
                  <HeartFilled
                    className={classNames(styles.icon, {
                      [styles.activeIcon]: activeTab === "wishlist",
                    })}
                  />
                  Sản phẩm yêu thích
                </Link>
              </li>
              <li>
                <Link
                  to="/account/orders"
                  className={classNames({
                    [styles.active]: activeTab === "orders",
                  })}
                  aria-label="Đơn hàng của bạn"
                >
                  <ShoppingCartOutlined
                    className={classNames(styles.icon, {
                      [styles.activeIcon]: activeTab === "orders",
                    })}
                  />
                  Đơn hàng của bạn
                </Link>
              </li>
            </ul>
          </>
        ) : (
          <div className={styles.loginPrompt}></div>
        )}
      </div>
    </motion.div>
  );
}

export default NavbarProfile;
