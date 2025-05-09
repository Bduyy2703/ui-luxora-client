import axios from "axios";
import { jwtDecode } from "jwt-decode";
import privateAxios from "./privateAxios";
const API_URL = "https://www.dclux.store/api/v1";

export const getAllCategories = async () => {
  try {
    const response = await privateAxios.get(`/v1/categories`);
    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    console.error("Error fetching all categories:", error);
    throw error;
  }
};
export const getChildrenCategories = async (parentId) => {
  try {
    const response = await axios.get(`${API_URL}/categories/${parentId}`);
    return response.data || [];
  } catch (error) {
    console.error("Lỗi khi lấy danh mục con:", error);
    throw error;
  }
};

export const getParentCategories = async () => {
  try {
    const categories = await getAllCategories();
    // Lọc các danh mục có parentId là null (danh mục cha)
    const parentCats = categories.filter((cat) => cat.parentId === null);
    return parentCats;
  } catch (error) {
    console.error("Error fetching parent categories:", error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await privateAxios.put(
      `/v1/categories/${id}`,
      categoryData,
    );
    return response.data || [];
  } catch (error) {
    console.error(`Error updating category with id ${id}:`, error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await privateAxios.post(`/v1/categories`, categoryData);
    return response.data || [];
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await privateAxios.delete(`/v1/categories/${id}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error deleting category with id ${id}:`, error);
    throw error;
  }
};

export const getCategoryByProduct = async (id) => {
  try {
    const response = await privateAxios.get(`/v1/categories/${id}/products`);
    return response.data || [];
  } catch (error) {
    console.error(`Error get product category with id ${id}:`, error);
    throw error;
  }
};

export const getAllProducts = async () => {
  try {
    const response = await privateAxios.get(`/admin/getAllProducts`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching all products:", error);
    throw error;
  }
};
