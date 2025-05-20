import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { notification, Modal, Upload, Image } from "antd";
import {
  StarFilled,
  StarOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PlusOutlined,
  LikeOutlined,
  LikeFilled,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import {
  getReviewsByProductId,
  createReview,
  updateReview,
  deleteReview,
  getProductReviewStatistics,
  toggleHiddenReview,
  adminDeleteReview,
  toggleLike,
} from "../../services/api/reviewService";
import styles from "./ReviewProduct.module.scss";

const ReviewProduct = ({ product }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [fileList, setFileList] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [helpfulVotes, setHelpfulVotes] = useState({});
  const [likedReviews, setLikedReviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState({});

  const userId = localStorage.getItem("userId");

  const isLoggedIn = () => {
    const accessToken = localStorage.getItem("accessToken");
    const email = localStorage.getItem("userEmail");
    return !!(accessToken && email);
  };

  const isAdmin = () => localStorage.getItem("userRole") === "admin";

  const fetchReviews = useCallback(async () => {
    if (!product?.id) {
      notification.error({
        message: "Thông báo",
        description: "Không tìm thấy thông tin sản phẩm",
        duration: 3,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await getReviewsByProductId(product.id, page, limit);
      console.log("Fetched reviews response:", response);
      if (response.error) {
        notification.error({
          message: "Thông báo",
          description: response.error,
          duration: 3,
        });
        return;
      }

      const sortedReviews = (response.reviews || []).sort((a, b) => {
        if (a.user?.id === userId) return -1;
        if (b.user?.id === userId) return 1;
        return 0;
      });

      setReviews(sortedReviews);
      setTotalReviews(response.total || 0);
      // Khởi tạo helpfulVotes và likedReviews từ dữ liệu API
      const votes = {};
      const liked = {};
      sortedReviews.forEach((review) => {
        votes[review.id] = review.likeCount || 0;
        liked[review.id] = review.isLiked || false; // Giả định API trả về isLiked
      });
      setHelpfulVotes(votes);
      setLikedReviews(liked);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      notification.error({
        message: "Thông báo",
        description: "Lỗi khi tải đánh giá",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  }, [product?.id, page, limit, userId]);

  const fetchStatistics = useCallback(async () => {
    if (!product?.id) {
      notification.error({
        message: "Thông báo",
        description: "Không tìm thấy thông tin sản phẩm",
        duration: 3,
      });
      return;
    }

    try {
      const response = await getProductReviewStatistics(product.id);
      console.log("Fetched statistics response:", response);
      if (response.error) {
        notification.error({
          message: "Thông báo",
          description: response.error,
          duration: 3,
        });
        return;
      }
      setAverageRating(response.averageRating || 0);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      notification.error({
        message: "Thông báo",
        description: "Lỗi khi tải thống kê đánh giá",
        duration: 3,
      });
    }
  }, [product?.id]);

  useEffect(() => {
    fetchReviews();
    fetchStatistics();
  }, [fetchReviews, fetchStatistics]);

  const handleStarClick = (rating) => {
    setNewReview((prev) => ({ ...prev, rating }));
  };

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn()) {
      notification.error({
        message: "Thông báo",
        description: "Vui lòng đăng nhập để gửi đánh giá",
        duration: 3,
      });
      navigate("/login");
      return;
    }

    if (!product || !product.id) {
      notification.error({
        message: "Thông báo",
        description: "Không tìm thấy thông tin sản phẩm",
        duration: 3,
      });
      return;
    }

    const productId = parseInt(product.id, 10);
    if (isNaN(productId) || !Number.isInteger(productId)) {
      notification.error({
        message: "Thông báo",
        description: "ID sản phẩm không hợp lệ",
        duration: 3,
      });
      return;
    }

    if (
      !Number.isInteger(newReview.rating) ||
      newReview.rating < 1 ||
      newReview.rating > 5
    ) {
      notification.error({
        message: "Thông báo",
        description: "Vui lòng chọn số sao từ 1 đến 5",
        duration: 3,
      });
      return;
    }

    if (
      !newReview.comment ||
      typeof newReview.comment !== "string" ||
      newReview.comment.trim() === ""
    ) {
      notification.error({
        message: "Thông báo",
        description: "Vui lòng nhập nội dung đánh giá",
        duration: 3,
      });
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        productId: productId,
        rating: Number(newReview.rating),
        comment: newReview.comment.trim(),
      };

      const formData = new FormData();
      formData.append("rating", reviewData.rating.toString());
      formData.append("comment", reviewData.comment);
      if (!editingReviewId) {
        formData.append("productId", reviewData.productId.toString());
      }

      const newFiles = fileList.filter((file) => file.originFileObj);
      newFiles.forEach((file) => {
        formData.append("files", file.originFileObj);
      });

      let keepFiles = [];
      if (editingReviewId) {
        keepFiles = fileList
          .filter((file) => file.status === "done" && file.fileId)
          .map((file) => ({
            fileId: file.fileId,
            fileName: file.fileName,
            bucketName: file.bucketName || "public",
          }));

        keepFiles.forEach((file, index) => {
          formData.append(`keepFiles[${index}][fileId]`, file.fileId);
          formData.append(`keepFiles[${index}][fileName]`, file.fileName);
          formData.append(`keepFiles[${index}][bucketName]`, file.bucketName);
        });
      }

      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      let response;
      if (editingReviewId) {
        response = await updateReview(editingReviewId, formData);
      } else {
        response = await createReview(formData);
      }

      if (response.error) {
        notification.error({
          message: "Thông báo",
          description: response.error,
          duration: 3,
        });
        return;
      }

      notification.success({
        message: "Thông báo",
        description: editingReviewId
          ? "Cập nhật đánh giá thành công"
          : "Gửi đánh giá thành công",
        duration: 3,
      });
      setNewReview({ rating: 0, comment: "" });
      setFileList([]);
      setExistingImages([]);
      setEditingReviewId(null);
      setIsModalVisible(false);
      fetchReviews();
      fetchStatistics();
    } catch (error) {
      console.error("Error submitting review:", error);
      notification.error({
        message: "Thông báo",
        description: "Lỗi khi gửi đánh giá",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setNewReview({ rating: review.rating, comment: review.comment });

    const existingImagesFormatted =
      review.images?.map((img, index) => ({
        uid: img.fileId || index,
        name: img.fileName || `image-${index}`,
        status: "done",
        url: img.fileUrl,
        fileId: img.fileId,
        fileName: img.fileName,
        bucketName: img.bucketName || "public",
      })) || [];
    setExistingImages(existingImagesFormatted);
    setFileList(existingImagesFormatted);
    setIsModalVisible(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!isLoggedIn()) {
      notification.error({
        message: "Thông báo",
        description: "Vui lòng đăng nhập để xóa đánh giá",
        duration: 3,
      });
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await deleteReview(reviewId);
      if (response.error) {
        notification.error({
          message: "Thông báo",
          description: response.error,
          duration: 3,
        });
        return;
      }

      notification.success({
        message: "Thông báo",
        description: "Xóa đánh giá thành công",
        duration: 3,
      });
      fetchReviews();
      fetchStatistics();
    } catch (error) {
      notification.error({
        message: "Thông báo",
        description: "Lỗi khi xóa đánh giá",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHidden = async (reviewId, isHidden) => {
    if (!isAdmin()) {
      notification.error({
        message: "Thông báo",
        description: "Chỉ admin mới có thể thực hiện thao tác này",
        duration: 3,
      });
      return;
    }

    setAdminLoading((prev) => ({ ...prev, [reviewId]: true }));
    try {
      const response = await toggleHiddenReview(reviewId);
      if (response.error) {
        notification.error({
          message: "Thông báo",
          description: response.error,
          duration: 3,
        });
        return;
      }

      notification.success({
        message: "Thông báo",
        description: `Đánh giá đã được ${response.isHidden ? "ẩn" : "hiển thị"}`,
        duration: 3,
      });
      fetchReviews();
    } catch (error) {
      notification.error({
        message: "Thông báo",
        description: "Lỗi khi bật/tắt trạng thái ẩn",
        duration: 3,
      });
    } finally {
      setAdminLoading((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleAdminDeleteReview = async (reviewId) => {
    if (!isAdmin()) {
      notification.error({
        message: "Thông báo",
        description: "Chỉ admin mới có thể thực hiện thao tác này",
        duration: 3,
      });
      return;
    }

    setAdminLoading((prev) => ({ ...prev, [reviewId]: true }));
    try {
      const response = await adminDeleteReview(reviewId);
      if (response.error) {
        notification.error({
          message: "Thông báo",
          description: response.error,
          duration: 3,
        });
        return;
      }

      notification.success({
        message: "Thông báo",
        description: "Xóa đánh giá thành công",
        duration: 3,
      });
      fetchReviews();
      fetchStatistics();
    } catch (error) {
      notification.error({
        message: "Thông báo",
        description: "Lỗi khi xóa đánh giá",
        duration: 3,
      });
    } finally {
      setAdminLoading((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleToggleLike = async (reviewId) => {
    if (!isLoggedIn()) {
      notification.error({
        message: "Thông báo",
        description: "Vui lòng đăng nhập để thích đánh giá",
        duration: 3,
      });
      navigate("/login");
      return;
    }

    try {
      const response = await toggleLike(reviewId);
      if (response.error) {
        notification.error({
          message: "Thông báo",
          description: response.error,
          duration: 3,
        });
        return;
      }

      setHelpfulVotes((prev) => ({
        ...prev,
        [reviewId]: response.likeCount,
      }));
      setLikedReviews((prev) => ({
        ...prev,
        [reviewId]: response.liked,
      }));
      notification.success({
        message: "Thông báo",
        description: response.liked
          ? "Đã thích đánh giá"
          : "Đã bỏ thích đánh giá",
        duration: 2,
      });
    } catch (error) {
      notification.error({
        message: "Thông báo",
        description: "Lỗi khi toggle like đánh giá",
        duration: 3,
      });
    }
  };

  const truncateComment = (comment, maxLength = 100) => {
    if (comment.length <= maxLength) return comment;
    return comment.substring(0, maxLength) + "...";
  };

  const getTimeAgo = (createdAt) => {
    const now = new Date();
    const reviewDate = new Date(createdAt);
    const diffInSeconds = Math.floor((now - reviewDate) / 1000);

    if (diffInSeconds < 60) return "Bây giờ";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  return (
    <div className={styles.reviewWrapper}>
      <div className={styles.headerSection}>
        <div className={styles.statsHeader}>
          <h2 className={styles.sectionTitle}>Đánh Giá Sản Phẩm</h2>
          <div className={styles.statsSummary}>
            <span className={styles.avgRating}>{averageRating.toFixed(1)}</span>
            <div className={styles.starRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarFilled
                  key={star}
                  className={styles.star}
                  style={{
                    color:
                      star <= Math.round(averageRating) ? "#F5C518" : "#E5E5E5",
                  }}
                />
              ))}
            </div>
            <span className={styles.reviewCount}>({totalReviews})</span>
          </div>
        </div>
        <motion.button
          className={styles.writeReviewButton}
          onClick={() => setIsModalVisible(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Viết Đánh Giá
        </motion.button>
      </div>

      <motion.div
        className={styles.reviewsSection}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence>
          {loading ? (
            <p className={styles.loadingText}>Đang tải...</p>
          ) : reviews.length === 0 ? (
            <p className={styles.noReviews}>Chưa có đánh giá nào.</p>
          ) : (
            <div className={styles.reviewList}>
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  className={styles.reviewCard}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className={styles.reviewHeader}>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>
                        {review.user?.username || "Người dùng"}
                      </span>
                      <span className={styles.reviewTime}>
                        {getTimeAgo(review.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.starRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarFilled
                        key={star}
                        className={styles.star}
                        style={{
                          color: star <= review.rating ? "#F5C518" : "#E5E5E5",
                        }}
                      />
                    ))}
                  </div>
                  <p className={styles.reviewComment}>
                    {truncateComment(review.comment)}
                    {review.comment.length > 100 && (
                      <span className={styles.readMore}>Xem thêm</span>
                    )}
                  </p>
                  {review.reply && review.reply.content && (
                    <motion.div
                      className={styles.reviewReply}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className={styles.replyLabel}>Phản hồi từ admin:</p>
                      <p className={styles.replyContent}>
                        {review.reply.content}
                      </p>
                    </motion.div>
                  )}
                  {review.images && review.images.length > 0 && (
                    <div className={styles.reviewImages}>
                      <Image.PreviewGroup>
                        {review.images.slice(0, 4).map((img, idx) => (
                          <div key={idx} className={styles.imageWrapper}>
                            <Image
                              src={img.fileUrl}
                              alt={`review-${idx}`}
                              className={`${styles.reviewImage} ${
                                idx === 3 && review.images.length > 4
                                  ? styles.dimmedImage
                                  : ""
                              }`}
                              style={{ cursor: "pointer" }}
                              onError={(e) =>
                                (e.target.src =
                                  "https://via.placeholder.com/60")
                              }
                            />
                            {idx === 3 && review.images.length > 4 && (
                              <div className={styles.imageOverlay}>
                                +{review.images.length - 4}
                              </div>
                            )}
                          </div>
                        ))}
                        {review.images.slice(4).map((img, idx) => (
                          <Image
                            key={`hidden-${idx}`}
                            src={img.fileUrl}
                            style={{ display: "none" }}
                          />
                        ))}
                      </Image.PreviewGroup>
                    </div>
                  )}
                  <div className={styles.reviewActions}>
                    <motion.button
                      onClick={() => handleToggleLike(review.id)}
                      className={styles.actionButtonLike}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {likedReviews[review.id] ? (
                        <LikeFilled style={{ color: "#1890ff" }} />
                      ) : (
                        <LikeOutlined />
                      )}
                      <span>{helpfulVotes[review.id] || 0}</span>
                    </motion.button>
                    {review.user?.id === userId && (
                      <>
                        <motion.button
                          onClick={() => handleEditReview(review)}
                          className={styles.actionButton}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          Chỉnh sửa
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteReview(review.id)}
                          className={styles.actionButtonDelete}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          Xóa
                        </motion.button>
                      </>
                    )}
                    {isAdmin() && (
                      <>
                        <motion.button
                          onClick={() =>
                            handleToggleHidden(review.id, review.isHidden)
                          }
                          className={`${styles.actionButton} ${
                            review.isHidden
                              ? styles.toggleShow
                              : styles.toggleHide
                          }`}
                          disabled={adminLoading[review.id]}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {adminLoading[review.id] ? (
                            "Đang xử lý..."
                          ) : review.isHidden ? (
                            <EyeOutlined />
                          ) : (
                            <EyeInvisibleOutlined />
                          )}
                        </motion.button>
                        <motion.button
                          onClick={() => handleAdminDeleteReview(review.id)}
                          className={styles.actionButton}
                          disabled={adminLoading[review.id]}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {adminLoading[review.id] ? (
                            "Đang xử lý..."
                          ) : (
                            <DeleteOutlined />
                          )}
                        </motion.button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {totalReviews > limit && (
        <motion.div
          className={styles.pagination}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className={`${styles.pageButton} ${page === 1 ? styles.disabled : ""}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Trước
          </motion.button>
          <span className={styles.pageInfo}>
            Trang {page} / {Math.ceil(totalReviews / limit)}
          </span>
          <motion.button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page === Math.ceil(totalReviews / limit)}
            className={`${styles.pageButton} ${
              page === Math.ceil(totalReviews / limit) ? styles.disabled : ""
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sau
          </motion.button>
        </motion.div>
      )}

      <Modal
        title={editingReviewId ? "Chỉnh Sửa Đánh Giá" : "Viết Đánh Giá Của Bạn"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setNewReview({ rating: 0, comment: "" });
          setFileList([]);
          setExistingImages([]);
          setEditingReviewId(null);
        }}
        footer={null}
      >
        <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
          <div className={styles.starRating}>
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                className={styles.starButton}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                aria-label={`Đánh giá ${star} sao`}
              >
                {star <= newReview.rating ? (
                  <StarFilled style={{ color: "#F5C518" }} />
                ) : (
                  <StarOutlined style={{ color: "#F5C518" }} />
                )}
              </motion.button>
            ))}
          </div>
          <textarea
            className={styles.commentInput}
            rows="4"
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            value={newReview.comment}
            onChange={(e) =>
              setNewReview((prev) => ({ ...prev, comment: e.target.value }))
            }
          />
          <div className={styles.formActions}>
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={() => false}
              multiple
              accept="image/*"
            >
              <motion.button
                type="button"
                className={styles.fileLabel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlusOutlined /> Thêm hình ảnh (tùy chọn)
              </motion.button>
            </Upload>
            <div className={styles.formButtons}>
              <motion.button
                type="submit"
                className={`${styles.submitButton} ${loading ? styles.disabled : ""}`}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading
                  ? "Đang xử lý..."
                  : editingReviewId
                    ? "Cập nhật"
                    : "Gửi đánh giá"}
              </motion.button>
              {editingReviewId && (
                <motion.button
                  type="button"
                  onClick={() => {
                    setEditingReviewId(null);
                    setNewReview({ rating: 0, comment: "" });
                    setFileList([]);
                    setExistingImages([]);
                  }}
                  className={styles.cancelButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Hủy
                </motion.button>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReviewProduct;
