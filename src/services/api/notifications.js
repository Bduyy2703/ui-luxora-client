import privateAxios from "./privateAxios";

export const getNotificationsByTypes = async (
  page = 1,
  limit = 20,
  types = [],
) => {
  try {
    const typesQuery = types.length > 0 ? `&types=${types.join(",")}` : "";
    const response = await privateAxios.get(
      `/v1/notification?page=${page}&limit=${limit}${typesQuery}`,
    );
    return {
      notifications: response.data.notifications || [],
      total: response.data.total || 0,
      unreadCount: response.data.unreadCount || 0,
    };
  } catch (error) {
    console.error("Error fetching notifications by types:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    await privateAxios.post(`/v1/notification/${notificationId}/read`, {});
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const getAllNotifications = async (page = 1, limit = 20, types = []) => {
  try {
    const typesQuery = types.length > 0 ? `&types=${types.join(",")}` : "";
    const response = await privateAxios.get(
      `/v1/notification/all?page=${page}&limit=${limit}${typesQuery}`,
    );
    return {
      notifications: response.data.notifications || [],
      total: response.data.total || 0,
      unreadCount: response.data.unreadCount || 0,
    };
  } catch (error) {
    console.error("Error fetching all notifications:", error);
    throw error;
  }
};

export const markNotificationAsReadAdmin = async (notificationId) => {
  try {
    await privateAxios.post(
      `/v1/notification/${notificationId}/read-admin`,
      {},
    );
  } catch (error) {
    console.error("Error marking notification as read (admin):", error);
    throw error;
  }
};
