import privateAxios from "./privateAxios";

export const getAllSales = async (query) => {
  try {
    const response = await privateAxios.get("/v1/sales", { params: query });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Lỗi khi lấy danh sách chương trình khuyến mãi",
    );
  }
};

export const getSaleById = async (id) => {
  try {
    const response = await privateAxios.get(`/v1/sales/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Lỗi khi lấy thông tin chương trình khuyến mãi",
    );
  }
};

export const getNotiUserId = async (saleId) => {
  try {
    const response = await privateAxios.post(`/v1/sales/notify-users/${saleId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Lỗi khi lấy thông tin chương trình khuyến mãi",
    );
  }
};

export const createSale = async (data) => {
  try {
    const response = await privateAxios.post("/v1/sales", data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi tạo chương trình khuyến mãi",
    );
  }
};

export const updateSale = async (id, data) => {
  try {
    const response = await privateAxios.put(`/v1/sales/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Lỗi khi cập nhật chương trình khuyến mãi",
    );
  }
};

export const deleteSale = async (id) => {
  try {
    await privateAxios.delete(`/v1/sales/${id}`);
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi xóa chương trình khuyến mãi",
    );
  }
};

export const addProductToSale = async (id, data) => {
  try {
    const response = await privateAxios.post(`/v1/sales/${id}/products`, data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi thêm sản phẩm vào chương trình",
    );
  }
};

export const removeProductFromSale = async (id, productId) => {
  try {
    await privateAxios.delete(`/v1/sales/${id}/products/${productId}`);
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi xóa sản phẩm khỏi chương trình",
    );
  }
};

export const addCategoryToSale = async (id, data) => {
  try {
    const response = await privateAxios.post(
      `/v1/sales/${id}/categories`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi thêm danh mục vào chương trình",
    );
  }
};

export const removeCategoryFromSale = async (id, categoryId) => {
  try {
    await privateAxios.delete(`/v1/sales/${id}/categories/${categoryId}`);
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi xóa danh mục khỏi chương trình",
    );
  }
};

export const getSaleActive = async () => {
  try {
    await privateAxios.get(`/v1/sales/active`);
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy sale chương trình",
    );
  }
};

export const getSaleProduct = async () => {
  try {
    await privateAxios.get(`/v1/sales/products`);
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy products chương trình",
    );
  }
};

export const getSaleCategories = async () => {
  try {
    await privateAxios.get(`/v1/sales/categories`);
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy categories chương trình",
    );
  }
};
