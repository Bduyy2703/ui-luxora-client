import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./Footer.module.scss";
import {
  FacebookFilled,
  InstagramFilled,
  TwitterOutlined,
  YoutubeFilled,
  ShopOutlined,
  QuestionCircleOutlined,
  SecurityScanOutlined,
} from "@ant-design/icons";
import { getAllBlogs } from "../../../../services/api/blogService";
import { getInventoryList } from "../../../../services/api/inventoryService";
import { getProductList } from "../../../../services/api/productService";
import logo from "../../../../assets/icon/LogoWeb.jpg";

function Footer() {
  const [blogs, setBlogs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [blogLoading, setBlogLoading] = useState(true);
  const [blogError, setBlogError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getAllBlogs();
        if (data.error) {
          setBlogError(data.error);
        } else {
          const formattedBlogs = data.blogs.slice(0, 3).map((blog) => ({
            id: blog.id,
            title: blog.title,
            thumbnail: blog.thumbnail,
            date: new Date(blog.createAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
          }));
          setBlogs(formattedBlogs);
        }
      } catch (err) {
        setBlogError("Không thể tải bài viết. Vui lòng thử lại sau.");
      } finally {
        setBlogLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await getInventoryList();
        const locationData = response.data.map((inventory) => ({
          warehouseName: inventory.warehouseName,
          location: inventory.location,
        }));
        setLocations(locationData);
      } catch (err) {
        setLocationError(
          "Không thể tải danh sách cơ sở. Vui lòng thử lại sau.",
        );
      } finally {
        setLocationLoading(false);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const productResponse = await getProductList(1, 100);
        if (productResponse.error) {
          console.error(
            "Lỗi khi tải danh mục sản phẩm:",
            productResponse.error,
          );
        } else {
          const productsData = productResponse.data || [];
          const uniqueCategories = [
            ...new Map(
              productsData
                .filter((product) => product.category)
                .map((product) => [
                  product.category.id,
                  { id: product.category.id, name: product.category.name },
                ]),
            ).values(),
          ];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh mục sản phẩm:", err);
      }
    };

    fetchCategories();
  }, []);

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  return (
    <footer className={styles.wrapper}>
      <div className={styles.introduce}>
        <span className={styles.intro}>GIỚI THIỆU</span>
        <img
          style={{ width: "170px", height: "57px" }}
          src={logo}
          alt="Caraluna Logo"
          className="lazyload loaded"
          loading="lazy"
        />
        <ul style={{ listStyle: "none" }}>
          <li>Địa chỉ:</li>
          {locations.slice(0, 3).map((loc, index) => (
            <li key={index}>Cơ sở: {loc.location}</li>
          ))}
          {locations.length === 0 && locationLoading && (
            <li>Đang tải danh sách cơ sở...</li>
          )}
          {locationError && <li>{locationError}</li>}
        </ul>
        <p>
          <strong>Điện thoại:</strong> 0768800022
        </p>
        <p>
          <strong>Email:</strong> info@mrDC.vn
        </p>
        <div className={styles.socialIcons}>
          <a
            className={styles.icon}
            href="https://www.facebook.com/caraluna.vn/"
            aria-label="Visit our Facebook page"
          >
            <FacebookFilled />
          </a>
          <a
            className={styles.icon}
            href="https://twitter.com/caraluna.vn/"
            aria-label="Visit our Twitter page"
          >
            <TwitterOutlined />
          </a>
          <a
            className={styles.icon}
            href="https://www.youtube.com/caraluna.vn/"
            aria-label="Visit our YouTube channel"
          >
            <YoutubeFilled />
          </a>
          <a
            className={styles.icon}
            href="https://www.instagram.com/caraluna.vn/"
            aria-label="Visit our Instagram page"
          >
            <InstagramFilled />
          </a>
        </div>
      </div>

      <div className={styles.newPost}>
        <div className={styles.new}>BÀI VIẾT MỚI</div>
        {blogLoading && <div>Đang tải bài viết...</div>}
        {blogError && <div>{blogError}</div>}
        {!blogLoading &&
          !blogError &&
          blogs.map((blog) => (
            <div className={styles.footerFlower} key={blog.id}>
              <div>
                <img
                  src={blog.thumbnail}
                  alt={blog.title}
                  style={{
                    width: "90px",
                    height: "60px",
                    marginRight: "10px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                  loading="lazy"
                />
              </div>
              <div className={styles.footerNote}>
                <span
                  className={styles.blogLink}
                  onClick={() => handleBlogClick(blog.id)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleBlogClick(blog.id)
                  }
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                >
                  {blog.title}
                </span>
                <span className={styles.time}>{blog.date}</span>
              </div>
            </div>
          ))}
        {!blogLoading && !blogError && (
          <motion.button
            className={styles.viewMoreButton}
            onClick={() => navigate("/list-blog")}
            whileHover={{
              scale: 1.05,
              backgroundColor: "#d4af37",
              color: "#fff",
            }}
            transition={{ duration: 0.3 }}
          >
            Xem thêm bài viết ...
          </motion.button>
        )}
      </div>

      <div className={styles.storeJewelry}>
        <span className={styles.store}>
          <ShopOutlined style={{ marginRight: "8px" }} />
          DANH MỤC SẢN PHẨM
        </span>
        <ul className={styles.list}>
          {categories.length > 0 ? (
            categories.slice(0, 7).map((category) => (
              <motion.li
                key={category.id}
                whileHover={{ scale: 1.05, color: "#d4af37" }}
                transition={{ duration: 0.3 }}
                onClick={() =>
                  navigate(`/list-product?categories=${category.id}`)
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  navigate(`/list-product?categories=${category.id}`)
                }
                role="button"
                tabIndex={0}
              >
                {category.name}
              </motion.li>
            ))
          ) : (
            <li>Không có danh mục nào.</li>
          )}
        </ul>
      </div>

      <div className={styles.support}>
        <span className={styles.store}>
          <QuestionCircleOutlined style={{ marginRight: "8px" }} />
          HỖ TRỢ
        </span>
        <ul className={styles.list}>
          <motion.li
            whileHover={{ scale: 1.05, color: "#d4af37" }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate("/terms-of-service")}
            onKeyDown={(e) =>
              e.key === "Enter" && navigate("/terms-of-service")
            }
            role="button"
            tabIndex={0}
          >
            Điều khoản dịch vụ
          </motion.li>
          <motion.li
            whileHover={{ scale: 1.05, color: "#d4af37" }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate("/shopping-guide")}
            onKeyDown={(e) => e.key === "Enter" && navigate("/shopping-guide")}
            role="button"
            tabIndex={0}
          >
            Hướng dẫn mua hàng
          </motion.li>
          <motion.li
            whileHover={{ scale: 1.05, color: "#d4af37" }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate("/payment-guide")}
            onKeyDown={(e) => e.key === "Enter" && navigate("/payment-guide")}
            role="button"
            tabIndex={0}
          >
            Hướng dẫn thanh toán
          </motion.li>
        </ul>
      </div>

      <div className={styles.policy}>
        <span className={styles.store}>
          <SecurityScanOutlined style={{ marginRight: "8px" }} />
          CHÍNH SÁCH
        </span>
        <ul className={styles.list}>
          <motion.li
            whileHover={{ scale: 1.05, color: "#d4af37" }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate("/privacy-policy")}
            onKeyDown={(e) => e.key === "Enter" && navigate("/privacy-policy")}
            role="button"
            tabIndex={0}
          >
            Chính sách bảo mật
          </motion.li>
          <motion.li
            whileHover={{ scale: 1.05, color: "#d4af37" }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate("/warranty-policy")}
            onKeyDown={(e) => e.key === "Enter" && navigate("/warranty-policy")}
            role="button"
            tabIndex={0}
          >
            Chính sách bảo hành
          </motion.li>
          <motion.li
            whileHover={{ scale: 1.05, color: "#d4af37" }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate("/return-policy")}
            onKeyDown={(e) => e.key === "Enter" && navigate("/return-policy")}
            role="button"
            tabIndex={0}
          >
            Chính sách đổi trả
          </motion.li>
          <motion.li
            whileHover={{ scale: 1.05, color: "#d4af37" }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate("/shipping-policy")}
            onKeyDown={(e) => e.key === "Enter" && navigate("/shipping-policy")}
            role="button"
            tabIndex={0}
          >
            Chính sách vận chuyển
          </motion.li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
