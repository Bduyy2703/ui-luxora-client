import privateAxios from "./privateAxios";

export const getAllInvoices = async () => {
  try {
    const response = await privateAxios.get(`/v1/invoices`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
};

export const getInvoiceById = async (id) => {
  try {
    const response = await privateAxios.get(`/v1/invoices/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching invoice by ID:", error);
    throw error;
  }
};

export const updateStatusInvoice = async (id, invoiceData) => {
  try {
    const response = await privateAxios.put(`/v1/payment/invoice/${id}`, invoiceData);
    return response.data || [];
  } catch (error) {
    console.error("Error updating invoice status:", error);
    throw error;
  }
};

export const getInvoiceStats = async (startDate, endDate) => {
  try {
    const start = startDate.format("YYYY-MM-DD");
    const end = endDate.format("YYYY-MM-DD");
    const revenueRes = await privateAxios.get(
      `/v1/invoices/statistics/revenue?startDate=${start}&endDate=${end}&onlyPaid=true`
    );
    const statusRes = await privateAxios.get(
      `/v1/invoices/statistics/status?startDate=${start}&endDate=${end}`
    );
    return {
      revenue: revenueRes.data.totalRevenue || 0,
      statusCounts: statusRes.data || { PAID: 0, PENDING: 0, CANCELLED: 0 },
    };
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    throw error;
  }
};