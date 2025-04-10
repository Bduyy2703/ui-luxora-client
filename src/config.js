const config = {
  API_URL: "http://35.247.185.8/api/",
  LIMIT: 10,
  TABLE_USER_COL: [
    {
      header: "Họ tên",
      key: "fullName",
    },
    {
      header: "Email",
      key: "email",
    },
    {
      header: "SĐT",
      key: "phone",
    },
    {
      header: "Trạng thái",
      key: "verified",
    },
    {
      header: "Ngày tạo",
      key: "createdAt",
    },
  ],
  TABLE_PRODUCT_COL: [
    {
      header: "Mã",
      key: "product_code",
    },
    {
      header: "Tên",
      key: "product_name",
    },
    {
      header: "Danh mục",
      key: "category",
    },
    {
      header: "Giá bán",
      key: "product_sale_price",
    },
    {
      header: "Tình trạng",
      key: "product_isAvailable",
    },
    {
      header: "Ngày tạo",
      key: "createdAt",
    },
  ],
  SHORT_TABLE_PRODUCT_COL: [
    {
      header: "Mã sản phẩm",
      key: "product_code",
    },
    {
      header: "Tên sản phẩm",
      key: "product_name",
    },
    {
      header: "Giá bán",
      key: "product_sale_price",
    },
    {
      header: "Số lượng",
      key: "quantity",
    },
    {
      header: "Tổng",
      key: "total_price",
    },
  ],
  TABLE_CATE_COL: [
    {
      header: "Tên danh mục",
      key: "name", // Sửa từ "category_name" thành "name"
    },
    {
      header: "Slug",
      key: "slug", // Thêm cột Slug để hiển thị
    },
  ],
  TABLE_INVOICE_COL: [
    {
      header: "Mã đơn",
      key: "orderCode",
    },
    {
      header: "Người mua",
      key: "username",
    },
    {
      header: "Trạng thái",
      key: "status",
    },
    {
      header: "Giá trị",
      key: "amountToPay",
    },
    {
      header: "Phương thức",
      key: "paymentMethod",
    },
    {
      header: "Ngày tạo",
      key: "createdAt",
    },
  ],
  TABLE_DISCOUNT_COL: [
    {
      header: "Tên",
      key: "name",
    },
    {
      header: "Điều kiện",
      key: "condition",
    },
    {
      header: "Ngày bắt đầu",
      key: "startDate",
    },
    {
      header: "Ngày kết thúc",
      key: "endDate",
    },
    {
      header: "Giảm",
      key: "discountAmount",
    },
    {
      header: "Loại",
      key: "discountType",
    },
  ],
  TABLE_STATIS_PRO_COL: [
    {
      header: "Mã sản phẩm",
      key: "code",
    },
    {
      header: "Tên sản phẩm",
      key: "name",
    },
    {
      header: "Số lượng",
      key: "quantity",
    },
  ],
};

export default config;
