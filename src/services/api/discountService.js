import axios from "axios";
import privateAxios from "./privateAxios";

const API_BASE_URL = "http://35.247.185.8/api";

export const fetchDiscounts = async ({ totalPrice }) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/discounts/validate-total?totalPrice=${totalPrice}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

export const addDiscount = async (discountData) => {
  try {
    const response = await privateAxios.post(
      `/v1/discounts`,
      discountData,
    );
    return response.data || [];
  } catch (error) {
    console.error("Error adding discounts:", error);
    throw error;
  }
};

export const deleteDiscount = async (id) => {
  try {
    const response = await privateAxios.delete(`/v1/discounts/${id}`);
    return response.data || [];
  } catch (error) {
    console.error("Error deleting discounts:", error);
    throw error;
  }
};

export const getDiscountList = async () => {
  try {
    const response = await privateAxios.get("/v1/discounts");
    return response.data || {};
  } catch (error) {
    console.error("Error fetching product list:", error);
    throw error;
  }
};

export const updateDiscount = async (id, discountData) => {
  try {
    const response = await privateAxios.put(`/v1/discounts/${id}`, discountData);
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
