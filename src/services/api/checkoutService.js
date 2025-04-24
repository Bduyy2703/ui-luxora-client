import axios from "axios";
import privateAxios from "./privateAxios";

const API_BASE_URL = "http://35.247.185.8/api";
export const fetchPayment = async ({ emailtoken, items, discount_id }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payment`, {
      emailtoken,
      items,
      discount_id,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

export const PaymentVNPAY = async ({
  email,
  addressId,
  otherAddress,
  items,
  paymentMethod,
  discount_id,
  totalAmount,
}) => {
  try {
    const address = otherAddress || addressId;
    const response = await axios.post(`${API_BASE_URL}/payment/create`, {
      email,
      address,
      items,
      paymentMethod,
      discount_id,
      totalAmount,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

export const retryPayment = async ({ invoiceId, paymentMethod = "VNPAY" }) => {
  try {
    const parsedInvoiceId = Number(invoiceId);
    if (isNaN(parsedInvoiceId)) {
      throw new Error("invoiceId phải là một số hợp lệ");
    }

    const response = await privateAxios.post(`/v1/payment/retry-payment`, {
      invoiceId: parsedInvoiceId,
      paymentMethod,
    });

    return {
      data: response.data,
      paymentUrl: response.data.paymentUrl,
    };
  } catch (error) {
    console.error("Error retrying payment:", error);
    throw error;
  }
};

export const cancelPayment = async (invoiceId) => {
  try {
    const response = await privateAxios.post(
      `/v1/payment/${invoiceId}/cancel`,
    );
    return response.data || [];
  } catch (error) {
    console.error("Error cancel discounts:", error);
    throw error;
  }
};
