import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Pagination,
  Button,
  Checkbox,
  Select,
  Drawer,
  Space,
  Empty,
  Tag,
  Collapse,
  Skeleton,
} from "antd";
import { FilterOutlined } from "@ant-design/icons";
import styles from "./BlogList.module.scss";
import { getAllBlogs } from "../../services/api/blogService";

const { Panel } = Collapse;

function BlogList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [displayedBlogs, setDisplayedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("newest");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const blogsPerPage = 6;

  // useEffect(() => {
  //   const searchParams = new URLSearchuncheckedParams(location.search);
  //   const categoryIds =
  //     searchParams
  //       .get("categories")
  //       ?.split(",")
  //       .map(Number)
  //       .filter((id) => id) || [];
  //   const urlKeyword = searchParams.get("keyword");

  //   setSelectedCategories(categoryIds);
  //   setKeyword(urlKeyword ? decodeURIComponent(urlKeyword) : "");
  // }, [location]);

  const fetchBlogs = useCallback(async () => {
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
          rawDate: new Date(blog.createAt),
          category: blog.category,
          views: blog.views || 0, // Giả định API cung cấp lượt xem
        }));
        const uniqueCategories = [
          ...new Map(
            formattedBlogs.map((blog) => [
              blog.category?.id,
              { id: blog.category?.id, name: blog.category?.name },
            ]),
          ).values(),
        ].filter((cat) => cat.id && cat.name);

        setBlogs(formattedBlogs);
        setFilteredBlogs(formattedBlogs);
        setCategories(uniqueCategories);
      }
    } catch (err) {
      setError("Không thể tải bài viết. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const removeVietnameseTones = (str) => {
    str = str.toLowerCase();
    str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    str = str.replace(/đ/g, "d").replace(/Đ/g, "D");
    return str;
  };

  const applyFilters = useCallback(() => {
    let filtered = [...blogs];

    if (keyword.trim()) {
      const searchTerms = removeVietnameseTones(keyword)
        .split(/\s+/)
        .filter((term) => term);
      filtered = filtered.filter((blog) => {
        const blogTitle = removeVietnameseTones(blog.title || "");
        return searchTerms.every((term) => blogTitle.includes(term));
      });
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(
        (blog) =>
          blog.category && selectedCategories.includes(blog.category.id),
      );
    }

    if (sortOrder === "newest") {
      filtered.sort((a, b) => b.rawDate - a.rawDate);
    } else {
      filtered.sort((a, b) => a.rawDate - b.rawDate);
    }

    setFilteredBlogs(filtered);
    const totalPages = Math.max(1, Math.ceil(filtered.length / blogsPerPage));
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
    const indexOfLastBlog = currentPage * blogsPerPage;
    const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
    setDisplayedBlogs(filtered.slice(indexOfFirstBlog, indexOfLastBlog));
  }, [blogs, selectedCategories, keyword, sortOrder, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, keyword]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];
      const queryParams = [];
      if (newCategories.length > 0) {
        queryParams.push(`categories=${newCategories.join(",")}`);
      }
      if (keyword) {
        queryParams.push(`keyword=${encodeURIComponent(keyword)}`);
      }
      const queryString =
        queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
      navigate(`/blog${queryString}`, { replace: true });
      return newCategories;
    });
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setKeyword("");
    setCurrentPage(1);
    navigate("/blog", { replace: true });
  };

  const isPopular = (blog) => {
    const topViewedBlogs = [...filteredBlogs]
      .filter((b) => b.views > 0)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((b) => b.id);
    return topViewedBlogs.includes(blog.id);
  };

  return (
    <div className={styles.wrapper}>
      <motion.div
        className={styles.mainContent}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {(keyword || selectedCategories.length > 0) && (
          <motion.button
            className={styles.backButton}
            onClick={() => navigate("/blog")}
            whileHover={{ backgroundColor: "#d4af37", color: "#fff" }}
            transition={{ duration: 0.3 }}
          >
            Quay lại
          </motion.button>
        )}
        <div className={styles.mobileFilterButton}>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setIsMobileFilterOpen(true)}
          >
            Bộ lọc
          </Button>
        </div>

        <div className={styles.blogSection}>
          <div className={styles.blogHeader}>
            <div className={styles.headerContent}>
              <motion.h2
                className={styles.mainHeading}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Tất cả bài viết
              </motion.h2>
              <motion.p
                className={styles.subHeading}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Khám phá những câu chuyện và mẹo hay
              </motion.p>
              <motion.div
                className={styles.decorativeDivider}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              />
            </div>
          </div>

          {loading ? (
            <div className={styles.blogGrid}>
              {Array.from({ length: blogsPerPage }).map((_, index) => (
                <Skeleton
                  key={index}
                  active
                  avatar={{ shape: "square", size: 200 }}
                  paragraph={{ rows: 2 }}
                  className={styles.skeletonCard}
                />
              ))}
            </div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : filteredBlogs.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có bài viết nào phù hợp với bộ lọc."
            />
          ) : (
            <div className={styles.blogGrid}>
              {displayedBlogs.map((blog) => (
                <motion.div
                  key={blog.id}
                  className={`${styles.blogCard} ${isPopular(blog) ? styles.popular : ""}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div className={styles.imageWrapper}>
                    {isPopular(blog) && (
                      <Tag color="#9b2c2c" className={styles.popularBadge}>
                        Nổi bật
                      </Tag>
                    )}
                    <img
                      src={blog.thumbnail || "/images/fallback.jpg"}
                      alt={`${blog.title} - Bài viết nổi bật`}
                      className={styles.blogImage}
                      loading="lazy"
                      onClick={() => handleBlogClick(blog.id)}
                      onError={(e) => {
                        e.target.src = "/images/fallback.jpg";
                      }}
                    />
                    <div className={styles.imageOverlay} />
                  </div>
                  <div className={styles.blogContent}>
                    <h3
                      className={styles.blogTitle}
                      onClick={() => handleBlogClick(blog.id)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleBlogClick(blog.id)
                      }
                      role="button"
                      tabIndex={0}
                    >
                      {blog.title}
                    </h3>
                    <span className={styles.blogDate}>{blog.date}</span>
                    {isPopular(blog) && (
                      <div className={styles.totalViews}>
                        Lượt xem: {blog.views}
                      </div>
                    )}
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

          {filteredBlogs.length > blogsPerPage && !loading && !error && (
            <div className={styles.pagination}>
              {Array.from(
                { length: Math.ceil(filteredBlogs.length / blogsPerPage) },
                (_, index) => index + 1,
              ).map((page) => (
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
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default BlogList;
