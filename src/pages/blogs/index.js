import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./BlogDetail.module.scss";
import { getAllBlogs, getBlogById } from "../../services/api/blogService";

function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [images, setImages] = useState([]);
  const [relatedBlogs, setRelatedBlogs] = useState([]); // Bài viết liên quan
  const [featuredBlogs, setFeaturedBlogs] = useState([]); // Tin tức nổi bật
  const [tags, setTags] = useState([]); // Tags
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gọi API để lấy chi tiết bài viết, bài viết liên quan, tin tức nổi bật, và tags
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy chi tiết bài viết
        const blogData = await getBlogById(id);
        if (blogData.error) {
          setError(blogData.error);
        } else {
          setBlog(blogData.blog);
          setImages(blogData.images || []);
        }

        // Lấy danh sách bài viết từ API để xử lý tags, tin tức nổi bật, và bài viết liên quan
        const blogsData = await getAllBlogs();
        if (!blogsData.error) {
          const allBlogs = blogsData.blogs;

          // Lấy bài viết liên quan (2 bài, không bao gồm bài hiện tại)
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

          // Lấy tin tức nổi bật (3 bài mới nhất, không bao gồm bài hiện tại)
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

          // Tạo tags (giả sử từ tiêu đề hoặc nội dung, vì API không có trường tags)
          const uniqueTags = Array.from(
            new Set(
              allBlogs.flatMap(
                (blog) =>
                  blog.title.split(" ").filter((word) => word.length > 3), // Tạo tags từ tiêu đề
              ),
            ),
          ).slice(0, 5); // Lấy tối đa 5 tags
          setTags(uniqueTags);
        }
      } catch (err) {
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Xử lý nội dung bài viết: Chuyển \r\n thành thẻ <p>
  const renderContent = (content) => {
    if (!content) return null;
    const paragraphs = content.split("\r\n\r\n").filter((p) => p.trim() !== "");
    return paragraphs.map((paragraph, index) => {
      if (paragraph.length < 50 && !paragraph.includes(" ")) {
        return (
          <h3 key={index} className={styles.subHeading}>
            {paragraph}
          </h3>
        );
      }
      return (
        <p key={index} className={styles.paragraph}>
          {paragraph}
        </p>
      );
    });
  };

  // Xử lý ngày đăng
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải bài viết...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!blog) {
    return <div className={styles.error}>Không tìm thấy bài viết.</div>;
  }

  return (
    <div className={styles.wrapper}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        {/* Danh mục sản phẩm */}
        <motion.div
          className={styles.sidebarSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h4 className={styles.sidebarTitle}>DANH MỤC SẢN PHẨM</h4>
          <ul className={styles.sidebarList}>
            {[
              "Earrings (Hoa tai)",
              "Rings (Nhẫn)",
              "Necklaces (Dây chuyền)",
              "Bracelets (Vòng tay)",
            ].map((item, index) => (
              <motion.li
                key={index}
                whileHover={{ scale: 1.05, color: "#007bff" }}
                transition={{ duration: 0.3 }}
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Tags */}
        <motion.div
          className={styles.sidebarSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h4 className={styles.sidebarTitle}>TAGS</h4>
          <div className={styles.tags}>
            <AnimatePresence>
              {tags.map((tag, index) => (
                <motion.span
                  key={tag}
                  className={styles.tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, backgroundColor: "#e0e0e0" }}
                >
                  {tag}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Tin tức nổi bật */}
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
      </div>

      {/* Main Content */}
      <motion.div
        className={styles.mainContent}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className={styles.header}>
          <div>
            {/* <motion.button
              className={styles.backButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
            >
              ← Quay lại
            </motion.button> */}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <h1 className={styles.title}>{blog.title}</h1>
            <div className={styles.meta}>
              <span>Đăng ngày: {formatDate(blog.createAt)}</span>
            </div>
          </div>
        </div>

        {blog.thumbnail && (
          <motion.div
            className={styles.heroImageWrapper}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={blog.thumbnail}
              alt={blog.title}
              className={styles.heroImage}
            />
          </motion.div>
        )}

        {blog.excerpt && (
          <motion.p
            className={styles.excerpt}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {blog.excerpt}
          </motion.p>
        )}

        <div className={styles.content}>
          {renderContent(blog.content)}
          {images.map(
            (image, index) =>
              index % 2 === 0 &&
              index < images.length - 1 && (
                <motion.img
                  key={image.fileId}
                  src={image.fileUrl}
                  alt={`Hình ảnh minh họa ${index + 1}`}
                  className={styles.contentImage}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              ),
          )}
        </div>

        {/* Related Posts */}
        {relatedBlogs.length > 0 && (
          <motion.div
            className={styles.relatedPosts}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className={styles.relatedPostsTitle}>Bài viết liên quan</h3>
            {relatedBlogs.map((relatedBlog) => (
              <motion.div
                key={relatedBlog.id}
                className={styles.relatedPost}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/blog/${relatedBlog.id}`)}
              >
                <img
                  src={relatedBlog.thumbnail}
                  alt={relatedBlog.title}
                  className={styles.relatedPostImage}
                />
                <div>
                  <p className={styles.relatedPostTitle}>{relatedBlog.title}</p>
                  <span className={styles.relatedPostDate}>
                    {relatedBlog.date}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default BlogDetail;
