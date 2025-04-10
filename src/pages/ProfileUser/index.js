import Header from "../../components/Layout/components/Header";
import Footer from "../../components/Layout/components/Footer";
// import Sidebar from './Sidebar';
import styles from "./DefaultProfile.module.scss";
import NavbarProfile from "./NavbarProfile";
// import ProfileUser from './profileUser';
import { useNavigate } from "react-router-dom";

function DefaultProfile({ children }) {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");
  const decodedToken = localStorage.getItem("decodedToken");

  // if (decodedToken !== "user") {
  //   localStorage.clear();
  // }
  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.container}>
        <NavbarProfile className={styles.navbar} />
        <div>
          {accessToken ? (
            <div className={styles.content}>{children}</div>
          ) : (
            <div className={styles.loginPrompt}>
              Vui lòng đăng nhập
              <button
                onClick={handleLoginRedirect}
                className={styles.loginButton}
              >
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default DefaultProfile;
