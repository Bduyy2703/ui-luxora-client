import privateAxios from "./privateAxios";

export const getCart = async () => {
  try {
    const response = await privateAxios.get("/v1/cart");
    return response.data || {};
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

export const deleteCart = async () => {
  try {
    const response = await privateAxios.delete("/v1/cart");
    return response.data || {};
  } catch (error) {
    console.error("Error deleting cart:", error);
    throw error;
  }
};

export const addToCart = async (cartData) => {
  try {
    const response = await privateAxios.post("/v1/cart/create", cartData);
    return response.data || {};
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const updateCartItem = async (cartItemId, quantity) => {
  try {
    const response = await privateAxios.patch(`/v1/cart/${cartItemId}`, {
      quantity,
    });
    return response.data || {};
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

export const deleteCartItem = async (cartItemId) => {
  try {
    const response = await privateAxios.delete(`/v1/cart/${cartItemId}`);
    return response.data || {};
  } catch (error) {
    console.error("Error deleting cart item:", error);
    throw error;
  }
};
