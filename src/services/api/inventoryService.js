import privateAxios from "./privateAxios";

export const addInventory = async (inventoryData) => {
  try {
    const response = await privateAxios.post(`/v1/inventory`, inventoryData);
    return response.data || [];
  } catch (error) {
    console.error("Error adding inventory:", error);
    throw error;
  }
};

export const deleteInventory = async (id) => {
  try {
    const response = await privateAxios.delete(`/v1/inventory/${id}`);
    return response.data || [];
  } catch (error) {
    console.error("Error deleting inventory:", error);
    throw error;
  }
};

export const getInventoryList = async () => {
  try {
    const response = await privateAxios.get("/v1/inventory");
    return response.data || {};
  } catch (error) {
    console.error("Error fetching inventory list:", error);
    throw error;
  }
};

export const updateInventory = async (id, inventoryData) => {
  try {
    const response = await privateAxios.put(
      `/v1/inventory/${id}`,
      inventoryData,
    );
    return response.data || [];
  } catch (error) {
    console.error("Error updating inventory:", error);
    throw error;
  }
};
