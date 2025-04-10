import privateAxios from "./privateAxios";

const API_BASE_URL = "http://35.247.185.8/api";

export const fetchProducts = async (limit, page) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/products/all?limit=${limit}&page=${page}`,
    );

    if (!response.ok) {
      throw new Error("Yêu cầu không hợp lệ");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

export const searchProducts = async (keyword, limit, page) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/products/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}&page=${page}`,
    );

    if (!response.ok) {
      throw new Error("Yêu cầu không hợp lệ");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

export const getProductDetail = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/detail/${id}`);

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

export const getSaleProducts = async (limit, page) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/products/sales?limit=${limit}&page=${page}`,
    );

    if (!response.ok) {
      throw new Error("Yêu cầu không hợp lệ");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

export const getProductbyCategory = async (categoryId, limit, page) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/products/category/${categoryId}?limit=${limit}&page=${page}`,
    );

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

export const filterProducts = async (filters, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams();

    params.append("Page", page);
    params.append("Limit", limit);

    if (filters.categoryId) {
      params.append("idcategory", filters.categoryId);
    }

    if (filters.priceRanges?.length > 0) {
      filters.priceRanges.forEach((price) =>
        params.append("priceRanges", price),
      );
    }

    if (filters.materials?.length > 0) {
      filters.materials.forEach((material) =>
        params.append("materials", material),
      );
    }

    if (filters.sizes?.length > 0) {
      filters.sizes.forEach((size) => params.append("sizes", size));
    }

    const response = await fetch(
      `${API_BASE_URL}/products/filter?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error("Yêu cầu không hợp lệ");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi lọc sản phẩm:", error);
    return { error: error.message };
  }
};

export const addProduct = async (productData) => {
  try {
    const response = await privateAxios.post(
      `/v1/products/create`,
      productData,
    );
    return response.data || [];
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await privateAxios.delete(`/v1/products/${id}`);
    return response.data || [];
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const getProductList = async (page = 1, limit = 10) => {
  try {
    const response = await privateAxios.get("/v1/products", {
      params: { page, limit },
    });
    return response.data || {};
  } catch (error) {
    console.error("Error fetching product list:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await privateAxios.put(`/v1/products/${id}`, productData);
    return response.data || [];
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const getByIdProduct = async (id) => {
  try {
    const response = await privateAxios.get(`/v1/products/${id}`);
    return response.data || [];
  } catch (error) {
    console.error("Error get product details:", error);
    throw error;
  }
};
