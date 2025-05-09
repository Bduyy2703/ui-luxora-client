import axios from "axios";
import { jwtDecode } from "jwt-decode";
import privateAxios from "./privateAxios";
import publicAxios from "./publicAxios";
const API_URL = "https://www.dclux.store/api/";

export const getWishList = async () => {
  try {
    const response = await privateAxios.get("/v1/wishlist");
    return response.data || {};
  } catch (error) {
    console.error("Error fetching all users list:", error);
    throw error;
  }
};

export const deleteWishList = async (productDetailId) => {
  try {
    const response = await privateAxios.delete(
      `/v1/wishlist/${productDetailId}`,
    );
    return response.data || {};
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const addWishList = async (productDetailId) => {
  try {
    const response = await privateAxios.post("/v1/wishlist/toggle", {
      productDetailId: productDetailId,
    });
    return response.data || {};
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    throw error;
  }
};

export const checkWishList = async (productDetailId) => {
  try {
    const response = await privateAxios.get(
      `/v1/wishlist/check/${productDetailId}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
