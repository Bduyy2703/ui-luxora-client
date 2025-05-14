import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./BlogList.module.scss";
import { getAllBlogs } from "../../services/api/blogService";

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("newest"); // newest or oldest
  const blogsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getAllBlogs();
        if (data.error) {
          setError(data.error);
        } else {
          const formattedBlogs = data.blogs.map((blog) => ({
            id: blog.id,
            title: blog.title,
            thumbnail: blog.thumbnail,
            date: new Date(blog.createAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
            rawDate: new Date(blog.createAt), // For sorting
          }));
          setBlogs(formattedBlogs);
          setFilteredBlogs(formattedBlogs);
        }
      } catch (err) {
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Handle sorting
  useEffect(() => {
    const sortedBlogs = [...blogs].sort((a, b) => {
      if (sortOrder === "newest") {
        return b.rawDate - a.rawDate;
      } else {
        return a.rawDate - b.rawDate;
      }
    });
    setFilteredBlogs(sortedBlogs);
    setCurrentPage(1); // Reset to first page when sorting changes
  }, [sortOrder, blogs]);

  // Pagination logic
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.wrapper}>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.header}>
          <h1 className={styles.title}>TẤT CẢ BÀI VIẾT</h1>
          <div className={styles.filter}>
            <label htmlFor="sortOrder">Sắp xếp: </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className={styles.skeleton}>
            {[...Array(blogsPerPage)].map((_, index) => (
              <div key={index} className={styles.skeletonItem}>
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonText} />
                <div className={styles.skeletonButton} />
              </div>
            ))}
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && filteredBlogs.length === 0 && (
          <div className={styles.empty}>Chưa có bài viết nào.</div>
        )}

        {!loading && !error && filteredBlogs.length > 0 && (
          <div className={styles.blogGrid}>
            {currentBlogs.map((blog) => (
              <motion.div
                key={blog.id}
                className={styles.blogCard}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div className={styles.imageWrapper}>
                  <img
                    src={blog.thumbnail}
                    alt={blog.title}
                    className={styles.blogImage}
                    loading="lazy"
                  />
                  <div className={styles.imageOverlay} />
                </div>
                <div className={styles.blogContent}>
                  <h2
                    className={styles.blogTitle}
                    onClick={() => handleBlogClick(blog.id)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleBlogClick(blog.id)
                    }
                    role="button"
                    tabIndex={0}
                  >
                    {blog.title}
                  </h2>
                  <span className={styles.blogDate}>{blog.date}</span>
                  <motion.button
                    className={styles.viewDetailsButton}
                    onClick={() => handleBlogClick(blog.id)}
                    whileHover={{ backgroundColor: "#d4af37", color: "#fff" }}
                    transition={{ duration: 0.3 }}
                  >
                    Xem chi tiết
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {totalPages > 1 && !loading && !error && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <motion.button
                  key={page}
                  className={`${styles.pageButton} ${
                    currentPage === page ? styles.active : ""
                  }`}
                  onClick={() => handlePageChange(page)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {page}
                </motion.button>
              ),
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default BlogList;
