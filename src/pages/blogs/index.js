import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Carousel, Skeleton } from "antd";
import styles from "./BlogDetail.module.scss";
import { getAllBlogs, getBlogById } from "../../services/api/blogService";
import { getProductList } from "../../services/api/productService";
import { FaArrowLeft, FaFacebook, FaTwitter } from "react-icons/fa";

function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [images, setImages] = useState([]);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const blogData = await getBlogById(id);
        if (blogData.error) {
          setError(blogData.error);
        } else {
          setBlog(blogData.blog);
          setImages(blogData.images || []);
        }

        const blogsData = await getAllBlogs();
        if (!blogsData.error) {
          const allBlogs = blogsData.blogs;

          const related = allBlogs
            .filter((blog) => blog.id !== parseInt(id))
            .slice(0, 2)
            .map((blog) => ({
              id: blog.id,
              title: blog.title,
              thumbnail: blog.thumbnail,
              date: new Date(blog.createAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
            }));
          setRelatedBlogs(related);

          const featured = allBlogs
            .filter((blog) => blog.id !== parseInt(id))
            .slice(0, 3)
            .map((blog) => ({
              id: blog.id,
              title: blog.title,
              thumbnail: blog.thumbnail,
              date: new Date(blog.createAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
            }));
          setFeaturedBlogs(featured);
        }

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
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const renderContent = (content) => {
    if (!content) return null;
    const paragraphs = content.split("\r\n\r\n").filter((p) => p.trim() !== "");
    return paragraphs.map((paragraph, index) => {
      const isHeading = paragraph.length < 50 && !paragraph.includes(" ");
      return (
        <div key={index} className={styles.contentSection}>
          {isHeading ? (
            <h3 className={styles.subHeading}>{paragraph}</h3>
          ) : (
            <div className={styles.textWrapper}>
              <p className={styles.paragraph}>{paragraph}</p>
            </div>
          )}
        </div>
      );
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const shareToFacebook = () => {
    const url = window.location.href;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
    );
  };

  const shareToTwitter = () => {
    const url = window.location.href;
    const text = blog ? blog.title : "Check out this blog post!";
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank",
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.sidebar}>
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
          <div className={styles.mainContent}>
            <Skeleton active title={{ width: "60%" }} paragraph={{ rows: 8 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!blog) {
    return <div className={styles.error}>Không tìm thấy bài viết.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <motion.div
            className={styles.sidebarSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h4 className={styles.sidebarTitle}>TIN TỨC NỔI BẬT</h4>
            <AnimatePresence>
              {featuredBlogs.map((featuredBlog, index) => (
                <motion.div
                  key={featuredBlog.id}
                  className={styles.featuredPost}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/blog/${featuredBlog.id}`)}
                >
                  <img
                    src={featuredBlog.thumbnail}
                    alt={featuredBlog.title}
                    className={styles.featuredImage}
                  />
                  <div>
                    <p className={styles.featuredTitle}>{featuredBlog.title}</p>
                    <span className={styles.featuredDate}>
                      {featuredBlog.date}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          <motion.div
            className={styles.sidebarSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h4 className={styles.sidebarTitle}>DANH MỤC SẢN PHẨM</h4>
            <ul className={styles.sidebarList}>
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <motion.li
                    key={category.id}
                    whileHover={{ scale: 1.05, color: "#d4af37" }}
                    transition={{ duration: 0.3 }}
                    onClick={() =>
                      navigate(`/list-product?categories=${category.id}`)
                    }
                  >
                    {category.name}
                  </motion.li>
                ))
              ) : (
                <li>Không có danh mục nào.</li>
              )}
            </ul>
          </motion.div>
        </div>

        {/* Main Content */}
        <motion.div
          className={styles.mainContent}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>{blog.title}</h1>
              <div className={styles.meta}>
                <span>Đăng ngày: {formatDate(blog.createAt)}</span>
              </div>
            </div>
          </div>

          {images.length > 0 && (
            <motion.div
              className={styles.imageCarousel}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Carousel
                autoplay
                dots
                effect="fade"
                autoplaySpeed={3000}
                className={styles.carousel}
              >
                {images.map((image, index) => (
                  <div key={image.fileId}>
                    <img
                      src={image.fileUrl}
                      alt={`Hình ảnh minh họa ${index + 1}`}
                      className={styles.carouselImage}
                    />
                  </div>
                ))}
              </Carousel>
            </motion.div>
          )}

          <div className={styles.contentGrid}>
            {blog.excerpt && (
              <motion.div
                className={styles.excerpt}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className={styles.excerptTitle}>Tóm tắt</h3>
                <p>{blog.excerpt}</p>
              </motion.div>
            )}

            <div className={styles.content}>
              <h3 className={styles.contentTitle}>Nội dung chi tiết</h3>
              {renderContent(blog.content)}
            </div>

            {images.length > 0 && (
              <div className={styles.imageGrid}>
                {images.map((image, index) => (
                  <motion.div
                    key={image.fileId}
                    className={styles.imageWrapper}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <img
                      src={image.fileUrl}
                      alt={`Hình ảnh minh họa ${index + 1}`}
                      className={styles.contentImage}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.shareSection}>
            <h4>Chia sẻ bài viết:</h4>
            <div className={styles.shareButtons}>
              <motion.button
                className={styles.shareButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={shareToFacebook}
              >
                <FaFacebook /> Facebook
              </motion.button>
              <motion.button
                className={styles.shareButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={shareToTwitter}
              >
                <FaTwitter /> Twitter
              </motion.button>
            </div>
          </div>

          {relatedBlogs.length > 0 && (
            <motion.div
              className={styles.relatedPosts}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className={styles.relatedPostsTitle}>Bài viết liên quan</h3>
              <div className={styles.relatedPostsGrid}>
                {relatedBlogs.map((relatedBlog, index) => (
                  <motion.div
                    key={relatedBlog.id}
                    className={styles.relatedPost}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate(`/blog/${relatedBlog.id}`)}
                  >
                    <img
                      src={relatedBlog.thumbnail}
                      alt={relatedBlog.title}
                      className={styles.relatedPostImage}
                    />
                    <div>
                      <p className={styles.relatedPostTitle}>
                        {relatedBlog.title}
                      </p>
                      <span className={styles.relatedPostDate}>
                        {relatedBlog.date}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default BlogDetail;
