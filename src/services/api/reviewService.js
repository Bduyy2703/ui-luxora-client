// src/services/api/reviewService.js
import privateAxios from "./privateAxios";
import publicAxios from "./publicAxios";
import config from "../../config";

const API_URL = config.API_URL;

// Private API: Lấy tất cả đánh giá trên hệ thống (dành cho admin)
export const getAllReviews = async (page = 1, limit = 10, isHidden = undefined, productId = undefined, userId = undefined) => {
  try {
    const response = await privateAxios.get(`${API_URL}/reviews`, {
      params: { page, limit, isHidden, productId, userId },
    });
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.message || "Error fetching all reviews" };
  }
};

// Private API: Lấy danh sách đánh giá của người dùng hiện tại
export const getMyReviews = async (page = 1, limit = 10) => {
  try {
    const response = await privateAxios.get(`${API_URL}/reviews/my-reviews`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.message || "Error fetching reviews" };
  }
};

// Private API: Tạo đánh giá mới
export const createReview = async (createReviewDto, files) => {
  try {
    const formData = new FormData();
    formData.append("productId", createReviewDto.productId);
    formData.append("rating", createReviewDto.rating);
    formData.append("comment", createReviewDto.comment);
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }

    const response = await privateAxios.post(`${API_URL}/reviews`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.message || "Error creating review" };
  }
};

// Public API: Lấy danh sách đánh giá của sản phẩm
export const getReviewsByProductId = async (productId, page = 1, limit = 10) => {
  try {
    const response = await publicAxios.get(`${API_URL}/reviews/product/${productId}`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.message || "Error fetching reviews by product" };
  }
};

// Private API: Cập nhật đánh giá
export const updateReview = async (id, updateReviewDto, files, keepFiles) => {
  try {
    const formData = new FormData();
    if (updateReviewDto.rating) formData.append("rating", updateReviewDto.rating);
    if (updateReviewDto.comment) formData.append("comment", updateReviewDto.comment);
    if (keepFiles) formData.append("keepFiles", JSON.stringify(keepFiles));
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }

    const response = await privateAxios.put(`${API_URL}/reviews/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.message || "Error updating review" };
  }
};

// Private API: Xóa đánh giá (dành cho user)
export const deleteReview = async (id) => {
  try {
    const response = await privateAxios.delete(`${API_URL}/reviews/${id}`);
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.message || "Error deleting review" };
  }
};

// Private API: Lấy sản phẩm được đánh giá cao nhất
export const getTopRatedProduct = async (minReviews = 5) => {
  try {
    const response = await privateAxios.get(`${API_URL}/reviews/top-rated-product`, {
      params: { minReviews },
    });
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.message || "Error fetching top rated product" };
  }
};

// Private API: Lấy sản phẩm được đánh giá thấp nhất
export const getLowestRatedProduct = async (minReviews = 5) => {
  try {
    const response = await privateAxios.get(`${API_URL}/reviews/lowest-rated-product`, {
      params: { minReviews },
    });
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.message || "Error fetching lowest rated product" };
  }
};

// Private API: Lấy sản phẩm có nhiều đánh giá nhất
export const getMostReviewedProduct = async () => {
  try {
    const response = await privateAxios.get(`${API_URL}/reviews/most-reviewed-product`);
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.message || "Error fetching most reviewed product" };
  }
};

// Private API: Lấy danh sách sản phẩm theo thứ tự đánh giá
export const getProductsByRating = async (order = 'DESC', page = 1, limit = 10, minReviews = 5) => {
  try {
    const response = await privateAxios.get(`${API_URL}/reviews/products-by-rating`, {
      params: { order, page, limit, minReviews },
    });
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.message || "Error fetching products by rating" };
  }
};

// Private API: Lấy thống kê đánh giá của sản phẩm
export const getProductReviewStatistics = async (productId) => {
  try {
    const response = await privateAxios.get(`${API_URL}/reviews/product/${productId}/statistics`);
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.message || "Error fetching product review statistics" };
  }
};

// Private API: Bật/tắt trạng thái ẩn của đánh giá (dành cho admin)
export const toggleHiddenReview = async (id) => {
  try {
    const response = await privateAxios.patch(`${API_URL}/reviews/${id}/toggle-hidden`, null);
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.message || "Error toggling review visibility" };
  }
};

// Private API: Xóa đánh giá (dành cho admin)
export const adminDeleteReview = async (id) => {
  try {
    const response = await privateAxios.delete(`${API_URL}/reviews/${id}/admin`);
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.message || "Error deleting review" };
  }
};