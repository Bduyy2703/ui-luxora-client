import axios from "axios";
import { jwtDecode } from "jwt-decode";
import privateAxios from "./privateAxios";
import publicAxios from "./publicAxios";
const API_URL = "https://www.dclux.store/api/";


export const addUser = async (userData) => {
  try {
    const response = await privateAxios.post("/v1/users/create", userData);
    return response.data || {};
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await privateAxios.delete(`/v1/users/${id}`);
    return response.data || {};
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const getAllUser = async () => {
  try {
    const response = await privateAxios.get("/v1/users/all");
    return response.data || {};
  } catch (error) {
    console.error("Error fetching all users list:", error);
    throw error;
  }
};

export const getUserProfile = async (email) => {
  try {
    const response = await axios.get(`${API_URL}/users/profiles/${email}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllProfiles = async () => {
  try {
    const response = await axios.get(`${API_URL}/v1/profiles/all`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("AccessToken không tồn tại");
    }

    const response = await privateAxios.get(`${API_URL}v1/profiles/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await privateAxios.patch(`/v1/users/me/change-password`, {
      oldPassword,
      newPassword,
    });

    return response.data.message;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!";
    console.error("Lỗi:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const getAddresses = async () => {
  try {
    const response = await privateAxios.get(`/v1/addresses/all`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchAddresses = async (query) => {
  try {
    const response = await privateAxios.get(`/v1/addresses/search`, {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addAddresses = async (email, address) => {
  try {
    const response = await privateAxios.post(`/v1/addresses`, {
      street: address.street,
      city: address.city,
      country: address.country,
      isDefault: address.isDefault || false,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editAddresses = async (id, address) => {
  try {
    const response = await privateAxios.put(`/v1/addresses/${id}`, {
      ...address,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAddresses = async (id) => {
  try {
    const response = await privateAxios.delete(`/v1/addresses/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllInvoices = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/invoices/getAll`, {
      params: { userId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getInvoiceDetail = async (invoiceId) => {
  try {
    const response = await axios.get(`${API_URL}/invoices/getInvoiceDetail`, {
      params: { invoiceId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
