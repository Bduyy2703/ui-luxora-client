import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Footer.module.scss";
import {
  FacebookFilled,
  InstagramFilled,
  TwitterOutlined,
  YoutubeFilled,
} from "@ant-design/icons";
import { getAllBlogs } from "../../../../services/api/blogService";
import { getInventoryList } from "../../../../services/api/inventoryService";

function Footer() {
  const [blogs, setBlogs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [blogLoading, setBlogLoading] = useState(true);
  const [blogError, setBlogError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const navigate = useNavigate();

  // useEffect cho Blog
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getAllBlogs();
        if (data.error) {
          setBlogError(data.error);
        } else {
          const formattedBlogs = data.blogs.slice(0, 4).map((blog) => ({
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

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.introduce}>
        <span className={styles.intro}>GIỚI THIỆU</span>
        <img
          width="200"
          height="43"
          src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/logo.png?1727259903818"
          alt="Caraluna Logo"
          className="lazyload loaded"
        />
        <ul style={{ listStyle: "none" }}>
          <li>Địa chỉ:</li>
          {locations.map((loc, index) => (
            <li key={index}>
              {loc.warehouseName}: {loc.location}
            </li>
          ))}
          {locations.length === 0 && locationLoading && (
            <li>Đang tải danh sách cơ sở...</li>
          )}
          {locationError && <li>{locationError}</li>}
        </ul>
        <p>
          <strong>Điện thoại:</strong> 084 272 96 86
        </p>
        <p>
          <strong>Email:</strong> info@caraluna.vn
        </p>
        <div>
          <a
            className={styles.icon}
            href="https://www.facebook.com/caraluna.vn/"
          >
            <FacebookFilled />
          </a>
          <a className={styles.icon} href="https://twitter.com/caraluna.vn/">
            <TwitterOutlined />
          </a>
          <a
            className={styles.icon}
            href="https://www.youtube.com/caraluna.vn/"
          >
            <YoutubeFilled />
          </a>
          <a
            className={styles.icon}
            href="https://www.instagram.com/caraluna.vn/"
          >
            <InstagramFilled />
          </a>
        </div>
        <div>
          <img
            src="https://bizweb.dktcdn.net/100/461/213/themes/870653/assets/bct.png?1728012064200"
            alt="BCT Certification"
            className="mt-4"
            style={{ width: "100px", height: "auto" }}
          />
          <img
            src="https://bizweb.dktcdn.net/100/461/213/files/logo-vnpay-qr-1.webp"
            alt="VNPAY QR"
            className="mt-4"
            style={{ width: "100px", height: "auto", marginLeft: "10px" }}
          />
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
                  }}
                />
              </div>
              <div className={styles.footerNote}>
                <span
                  className={styles.blogLink}
                  onClick={() => handleBlogClick(blog.id)}
                  style={{ cursor: "pointer" }}
                >
                  {blog.title}
                </span>
                <span className={styles.time}>{blog.date}</span>
              </div>
            </div>
          ))}
      </div>

      <div className={styles.storeJewelry}>
        <span className={styles.store}>CỬA HÀNG TRANG SỨC</span>
        <ul className={styles.list}>
          <li>Earrings (Hoa tai)</li>
          <li>Rings (Nhẫn)</li>
          <li>Necklaces (Dây chuyền)</li>
          <li>Bracelets (Vòng tay)</li>
        </ul>
      </div>

      <div className={styles.support}>
        <span className={styles.store}>HỖ TRỢ</span>
        <ul className={styles.list}>
          <li>Điều khoản dịch vụ</li>
          <li>Hướng dẫn mua hàng</li>
          <li>Hướng dẫn thanh toán</li>
        </ul>
      </div>

      <div className={styles.policy}>
        <span className={styles.store}>CHÍNH SÁCH</span>
        <ul className={styles.list}>
          <li>Chính sách bảo mật</li>
          <li>Chính sách bảo hành</li>
          <li>Chính sách đổi trả</li>
          <li>Chính sách vận chuyển</li>
        </ul>
      </div>
    </div>
  );
}

export default Footer;
