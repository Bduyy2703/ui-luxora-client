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

export const getInvoiceByUser = async (userId) => {
  try {
    const response = await privateAxios.get(`/v1/invoices/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching invoice by ID:", error);
    throw error;
  }
};

export const updateStatusInvoice = async (id, invoiceData) => {
  try {
    const response = await privateAxios.put(
      `/v1/payment/invoice/${id}`,
      { status :invoiceData} ,
    );
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
      `/v1/invoices/statistics/revenue?startDate=${start}&endDate=${end}&onlyPaid=true`,
    );
    const statusRes = await privateAxios.get(
      `/v1/invoices/statistics/status?startDate=${start}&endDate=${end}`,
    );
    return {
      revenue: revenueRes.data.totalRevenue || 0,
      statusCounts: statusRes.data || {
        PAID: 0,
        PENDING: 0,
        CANCELLED: 0,
        FAILED: 0,
      },
    };
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    throw error;
  }
};

export const getInvoiceRevenue = async (startDate, endDate, onlyPaid) => {
  try {
    const start = startDate.format("YYYY-MM-DD");
    const end = endDate.format("YYYY-MM-DD");
    const revenueRes = await privateAxios.get(
      `/v1/invoices/statistics/revenue?startDate=${start}&endDate=${end}&onlyPaid=${onlyPaid}`,
    );

    return {
      revenue: revenueRes.data.totalRevenue || 0,
      totalInvoice: revenueRes.data.totalInvoices || 0,
    };
  } catch (error) {
    console.error("Error fetching invoice revenue:", error);
    throw error;
  }
};

export const getStatusStatistics = async (startDate, endDate) => {
  try {
    const start = startDate.format("YYYY-MM-DD");
    const end = endDate.format("YYYY-MM-DD");
    const statusRes = await privateAxios.get(
      `/v1/invoices/statistics/status?startDate=${start}&endDate=${end}`,
    );
    return statusRes.data;
  } catch (error) {
    console.error("Error fetching status statistics:", error);
    throw error;
  }
};

export const getTopProducts = async (
  startDate,
  endDate,
  limit = 5,
  onlyPaid = true,
) => {
  try {
    const start = startDate.format("YYYY-MM-DD");
    const end = endDate.format("YYYY-MM-DD");
    const response = await privateAxios.get(
      `/v1/invoices/statistics/top-products?startDate=${start}&endDate=${end}&limit=${limit}&onlyPaid=${onlyPaid}`,
    );
    return response.data || [];
  } catch (error) {
    console.error("Error fetching top products:", error);
    throw error;
  }
};

export const getTopCustomers = async (
  startDate,
  endDate,
  limit,
  onlyPaid = true,
) => {
  try {
    const start = startDate.format("YYYY-MM-DD");
    const end = endDate.format("YYYY-MM-DD");
    const response = await privateAxios.get(
      `/v1/invoices/statistics/top-customers?startDate=${start}&endDate=${end}&limit=${limit}&onlyPaid=${onlyPaid}`,
    );
    return response.data || [];
  } catch (error) {
    console.error("Error fetching top customers:", error);
    throw error;
  }
};

export const getPaymentMethodStatistics = async (
  startDate,
  endDate,
  onlyPaid = true,
) => {
  try {
    const start = startDate.format("YYYY-MM-DD");
    const end = endDate.format("YYYY-MM-DD");
    const response = await privateAxios.get(
      `/v1/invoices/statistics/payment-methods?startDate=${start}&endDate=${end}&onlyPaid=${onlyPaid}`,
    );
    return response.data || [];
  } catch (error) {
    console.error("Error fetching payment method statistics:", error);
    throw error;
  }
};

export const getInvoiceCountStatistics = async (type, year, month) => {
  try {
    const params = month ? { type, year, month } : { type, year };
    const response = await privateAxios.get(
      `/v1/invoices/statistics/invoice-count`,
      {
        params,
      },
    );
    return response.data || [];
  } catch (error) {
    console.error("Error fetching invoice count statistics:", error);
    throw error;
  }
};
