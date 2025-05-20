import privateAxios from "./privateAxios";
import publicAxios from "./publicAxios";
import config from "../../config";
const API_URL = config.API_URL;

export const getAllReviews = async (
  page = 1,
  limit = 10,
  isHidden = undefined,
  productId = undefined,
  userId = undefined,
) => {
  try {
    const response = await privateAxios.get(`${API_URL}/v1/reviews`, {
      params: { page, limit, isHidden, productId, userId },
    });
    return response.data; // { reviews: [], total: number }
  } catch (error) {
    return {
      error: error.response?.data?.message || "Lỗi khi lấy danh sách đánh giá",
    };
  }
};

export const getMyReviews = async (page = 1, limit = 10) => {
  try {
    const response = await privateAxios.get(`/v1/reviews/my-reviews`, {
      params: { page, limit },
    });
    return response.data; // { reviews: [], total: number, page: number, limit: number, totalPages: number }
  } catch (error) {
    return {
      error:
        error.response?.data?.message ||
        "Lỗi khi lấy danh sách đánh giá cá nhân",
    };
  }
};

// Tạo đánh giá mới
export const createReview = async (formData) => {
  try {
    const response = await privateAxios.post("/v1/reviews", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.message || "Lỗi không xác định" };
  }
};

// Cập nhật đánh giá
export const updateReview = async (reviewId, formData) => {
  try {
    formData.forEach((value, key) => {
      console.log("332131312", `${key}:${value}`);
    });
    const response = await privateAxios.put(
      `/v1/reviews/${reviewId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.message || "Lỗi không xác định" };
  }
};

// Lấy danh sách đánh giá của sản phẩm
export const getReviewsByProductId = async (
  productId,
  page = 1,
  limit = 10,
) => {
  try {
    const response = await publicAxios.get(`/v1/reviews/product/${productId}`, {
      params: { page, limit },
    });
    return response.data; // { reviews: [], total: number, page: number, limit: number, totalPages: number }
  } catch (error) {
    return {
      error: error.response?.data?.message || "Lỗi khi lấy đánh giá sản phẩm",
    };
  }
};

// Xóa đánh giá (dành cho user)
export const deleteReview = async (id) => {
  try {
    const response = await privateAxios.delete(`/v1/reviews/${id}`);
    return response.data; // { message: string }
  } catch (error) {
    return {
      error: error.response?.data?.message || "Lỗi khi xóa đánh giá",
    };
  }
};

// Lấy thống kê đánh giá của sản phẩm
export const getProductReviewStatistics = async (productId) => {
  try {
    const response = await privateAxios.get(
      `${API_URL}/v1/reviews/product/${productId}/statistics`,
    );
    return response.data; // { averageRating: number, totalReviews: number, ratingDistribution: object }
  } catch (error) {
    return {
      error:
        error.response?.data?.message ||
        "Lỗi khi lấy thống kê đánh giá sản phẩm",
    };
  }
};

// Lấy sản phẩm được đánh giá cao nhất
export const getTopRatedProduct = async (minReviews = 5) => {
  try {
    const response = await privateAxios.get(
      `${API_URL}/v1/reviews/top-rated-product`,
      {
        params: { minReviews },
      },
    );
    return response.data; // { product: { id, name, ... }, averageRating: number, totalReviews: number }
  } catch (error) {
    return {
      error:
        error.response?.data?.message ||
        "Lỗi khi lấy sản phẩm đánh giá cao nhất",
    };
  }
};

// Lấy sản phẩm được đánh giá thấp nhất
export const getLowestRatedProduct = async (minReviews = 5) => {
  try {
    const response = await privateAxios.get(
      `${API_URL}/v1/reviews/lowest-rated-product`,
      {
        params: { minReviews },
      },
    );
    return response.data; // { product: { id, name, ... }, averageRating: number, totalReviews: number }
  } catch (error) {
    return {
      error:
        error.response?.data?.message ||
        "Lỗi khi lấy sản phẩm đánh giá thấp nhất",
    };
  }
};

// Lấy sản phẩm có nhiều đánh giá nhất
export const getMostReviewedProduct = async () => {
  try {
    const response = await privateAxios.get(
      `${API_URL}/v1/reviews/most-reviewed-product`,
    );
    return response.data; // { product: { id, name, ... }, totalReviews: number }
  } catch (error) {
    return {
      error:
        error.response?.data?.message ||
        "Lỗi khi lấy sản phẩm có nhiều đánh giá nhất",
    };
  }
};

// Lấy danh sách sản phẩm theo thứ tự đánh giá
export const getProductsByRating = async (
  order = "DESC",
  page = 1,
  limit = 10,
  minReviews = 5,
) => {
  try {
    const response = await privateAxios.get(
      `${API_URL}/v1/reviews/products-by-rating`,
      {
        params: { order, page, limit, minReviews },
      },
    );
    return response.data; // { products: [{ product: { id, name, ... }, averageRating: number, totalReviews: number }], total: number, page: number, limit: number, totalPages: number }
  } catch (error) {
    return {
      error:
        error.response?.data?.message ||
        "Lỗi khi lấy danh sách sản phẩm theo đánh giá",
    };
  }
};

// Bật/tắt trạng thái ẩn của đánh giá (dành cho admin)
export const toggleHiddenReview = async (id) => {
  try {
    const response = await privateAxios.patch(
      `${API_URL}/v1/reviews/${id}/toggle-hidden`,
    );
    return response.data; // { message: string, isHidden: boolean }
  } catch (error) {
    return {
      error:
        error.response?.data?.message ||
        "Lỗi khi bật/tắt trạng thái ẩn đánh giá",
    };
  }
};

// Xóa đánh giá (dành cho admin)
export const adminDeleteReview = async (id) => {
  try {
    const response = await privateAxios.delete(
      `${API_URL}/v1/reviews/${id}/admin`,
    );
    return response.data; // { message: string }
  } catch (error) {
    return {
      error: error.response?.data?.message || "Lỗi khi xóa đánh giá",
    };
  }
};

export const replyToReview = async (reviewId, content) => {
  try {
    const response = await privateAxios.post(
      `${API_URL}/v1/reviews/${reviewId}/reply`,
      { content },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data; // { message: string, reply: string }
  } catch (error) {
    return {
      error: error.response?.data?.message || "Lỗi khi trả lời đánh giá",
    };
  }
};
export const toggleLike = async (reviewId) => {
  try {
    const response = await privateAxios.post(
      `${API_URL}/v1/reviews/${reviewId}/toggle-like`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data; // { message: string, liked: boolean, likeCount: number }
  } catch (error) {
    return {
      error: error.response?.data?.message || "Lỗi khi toggle like đánh giá",
    };
  }
};
