import axios from "axios";

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

export const retryPayment = async ({ invoiceId }) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/invoices/retryPayment`,
      null,
      {
        params: {
          invoiceId: invoiceId,
        },
      },
    );

    return {
      data: response.data,
      paymentUrl: response.data.paymenturl,
    };
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};
