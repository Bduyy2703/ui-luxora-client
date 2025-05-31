import privateAxios from "./privateAxios";
import publicAxios from "./publicAxios";

export const addProductDetails = async (productId, productDetailsData) => {
  try {
    const response = await privateAxios.post(
      `/v1/product-details/create/${productId}`,
      productDetailsData,
    );
    return response.data || [];
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const deleteProductDetails = async (id) => {
  try {
    const response = await privateAxios.delete(`/v1/product-details/${id}`);
    return response.data || [];
  } catch (error) {
    console.error("Error deleting inventory:", error);
    throw error;
  }
};

export const getAllProductDetails = async (productId) => {
  try {
    const response = await privateAxios.get(`/v1/product-details/${productId}`);
    return response.data || [];
  } catch (error) {
    console.error("Error deleting inventory:", error);
    throw error;
  }
};

export const getProductDetailsByIdDetails = async (productId) => {
  try {
    const response = await privateAxios.get(
      `/v1/product-details/detail/${productId}`,
    );
    return response.data || [];
  } catch (error) {
    console.error("Error deleting inventory:", error);
    throw error;
  }
};

export const getByIdProduct = async (id) => {
  try {
    const response = await publicAxios.get(`/v1/products/${id}`);
    return response.data || [];
  } catch (error) {
    console.error("Error get product details:", error);
    throw error;
  }
};
export const updateProductDetails = async (id, productDetailsData) => {
  try {
    const response = await privateAxios.put(
      `/v1/product-details/${id}`,
      productDetailsData,
    );

    return response.data || [];
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};
