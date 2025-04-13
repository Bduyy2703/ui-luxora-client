import React, { useState, useEffect } from "react";
import {
  Card,
  DatePicker,
  Row,
  Col,
  Typography,
  Spin,
  Menu,
  Layout,
  Statistic,
  Select,
  Switch,
  InputNumber,
  Image,
} from "antd";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import moment from "moment";
import styles from "./statistics.module.scss";
import {
  getInvoiceRevenue,
  getStatusStatistics,
  getTopProducts,
  getTopCustomers,
  getPaymentMethodStatistics,
  getInvoiceCountStatistics,
} from "../../../services/api/invoiceService";
import {
  LogoutOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  PercentageOutlined,
  StarOutlined,
  BarChartOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { getProductDetailsByIdDetails } from "../../../services/api/productDetailService";
import { IconTruckDelivery } from "@tabler/icons-react";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminStatis = () => {
  const [dateRange, setDateRange] = useState([
    moment("2025-03-13"),
    moment("2025-04-12"),
  ]);
  const [revenue, setRevenue] = useState(0);
  const [totalInvoice, setTotalInvoice] = useState(0);
  const [statusData, setStatusData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [invoiceCount, setInvoiceCount] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productImages, setProductImages] = useState({});

  // Separate onlyPaid states for each chart
  const [onlyPaidRevenue, setOnlyPaidRevenue] = useState(true);
  const [onlyPaidTopProducts, setOnlyPaidTopProducts] = useState(true);
  const [onlyPaidTopCustomers, setOnlyPaidTopCustomers] = useState(true);
  const [onlyPaidPaymentMethods, setOnlyPaidPaymentMethods] = useState(true);

  // Other filters
  const [topProductLimit, setTopProductLimit] = useState(5);
  const [topCustomerLimit, setTopCustomerLimit] = useState(2);
  const [invoiceCountType, setInvoiceCountType] = useState("daily");
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(9);

  const COLORS = {
    PAID: "#8B5A2B", // Nâu đậm nhẹ
    PENDING: "#D2B48C", // Nâu nhạt hơn
    CANCELLED: "#A0522D", // Nâu đỏ nhẹ
    FAILED: "#CD853F", // Nâu cam nhẹ
    PRODUCT: ["#F5F5DC", "#8B5A2B"], // Gradient từ kem nhạt đến nâu
  };

  const fetchData = async () => {
    setLoading(true);
    const startDate = dateRange[0];
    const endDate = dateRange[1];

    try {
      // Revenue Statistics
      const revenueRes = await getInvoiceRevenue(
        startDate,
        endDate,
        onlyPaidRevenue,
      );
      console.log("Revenue Response:", revenueRes);
      setRevenue(revenueRes.revenue || 0);
      setTotalInvoice(revenueRes.totalInvoice || 0);

      // Status Statistics
      const statusRes = await getStatusStatistics(startDate, endDate);
      console.log("Status Response:", statusRes);
      const statusStats = statusRes?.statistics || [];
      const statusDataMapped = [
        { name: "PAID", value: 0 },
        { name: "PENDING", value: 0 },
        { name: "CANCELLED", value: 0 },
        { name: "FAILED", value: 0 },
      ].map((item) => {
        const stat = statusStats.find((s) => s.status === item.name);
        return { ...item, value: stat ? stat.count : 0 };
      });
      setStatusData(statusDataMapped);

      // Top Products
      const topProductsRes = await getTopProducts(
        startDate,
        endDate,
        topProductLimit,
        onlyPaidTopProducts,
      );
      const topProductsData = topProductsRes.map((item) => ({
        name: `${item.productName} (ID: ${item.productDetailId})`,
        revenue: item.totalRevenue,
        productDetailId: item.productDetailId,
      }));
      setTopProducts(topProductsData);

      // Fetch product images for Top Products
      const imagePromises = topProductsData.map(async (product) => {
        const productDetails = await getProductDetailsByIdDetails(
          product.productDetailId,
        );
        return {
          productDetailId: product.productDetailId,
          imageUrl:
            productDetails.images?.[0]?.fileUrl ||
            "https://via.placeholder.com/40?text=Product",
        };
      });
      const images = await Promise.all(imagePromises);
      const imageMap = images.reduce((acc, item) => {
        acc[item.productDetailId] = item.imageUrl;
        return acc;
      }, {});
      setProductImages(imageMap);

      // Top Customers
      const topCustomersRes = await getTopCustomers(
        startDate,
        endDate,
        topCustomerLimit,
        onlyPaidTopCustomers,
      );
      setTopCustomers(
        topCustomersRes.map((item) => ({
          name: item.username,
          totalSpent: item.totalSpent,
        })),
      );

      // Payment Method Statistics
      const paymentRes = await getPaymentMethodStatistics(
        startDate,
        endDate,
        onlyPaidPaymentMethods,
      );
      const paymentData = paymentRes.reduce((acc, item) => {
        const existing = acc.find(
          (d) => d.paymentMethod === item.paymentMethod,
        );
        if (existing) {
          existing[item.status] = item.totalRevenue;
        } else {
          acc.push({
            paymentMethod: item.paymentMethod,
            [item.status]: item.totalRevenue,
          });
        }
        return acc;
      }, []);
      setPaymentMethods(paymentData);

      // Invoice Count Statistics
      const invoiceCountRes = await getInvoiceCountStatistics(
        invoiceCountType,
        selectedYear,
        invoiceCountType === "daily" ? selectedMonth : undefined,
      );
      setInvoiceCount(
        invoiceCountRes.map((item) => ({
          period: item.period,
          count: item.count,
        })),
      );
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    dateRange,
    onlyPaidRevenue,
    onlyPaidTopProducts,
    onlyPaidTopCustomers,
    onlyPaidPaymentMethods,
    topProductLimit,
    topCustomerLimit,
    invoiceCountType,
    selectedYear,
    selectedMonth,
  ]);

  // Custom Label để hiển thị hình ảnh trên cột
  const CustomBarLabel = (props) => {
    const { x, y, width, height, value, index } = props;
    const product = topProducts[index];
    const imageUrl =
      productImages[product.productDetailId] ||
      "https://via.placeholder.com/40?text=Product";
    return (
      <g>
        <image
          href={imageUrl}
          x={x + width / 2 - 20}
          y={y - 50}
          width="40"
          height="40"
          className={styles.barImage}
        />
      </g>
    );
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        paddingLeft: "50px",
        background: "linear-gradient(135deg, #F5F5DC, #e0e0e0)",
      }}
    >
      {/* Sidebar */}
      <Sider width={200} className={styles.sider}>
        <div className={styles.logo}>
          <Title level={4} style={{ color: "#fff", margin: 0 }}>
            CARALUNA JEWELRY & GIFTS
          </Title>
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["5"]}>
          <Menu.Item key="1" icon={<LogoutOutlined />}>
            Đăng xuất
          </Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>
            Quản lý người dùng
          </Menu.Item>
          <Menu.Item key="3" icon={<ShoppingCartOutlined />}>
            Quản lý sản phẩm
          </Menu.Item>
          <Menu.Item key="4" icon={<PercentageOutlined />}>
            Quản lý giảm giá
          </Menu.Item>
          <Menu.Item key="5" icon={<BarChartOutlined />}>
            Thống kê
          </Menu.Item>
          <Menu.Item key="6" icon={<StarOutlined />}>
            Đánh giá
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        {/* Header */}
        <Header className={styles.header}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              format="YYYY-MM-DD"
              className={styles.datePicker}
            />
          </div>
        </Header>

        {/* Content */}
        <Content className={styles.content}>
          <Spin spinning={loading}>
            <Row gutter={[24, 24]}>
              {/* Revenue Statistics */}
              <Col xs={24} md={12}>
                <Card className={styles.card}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Text strong>Chỉ tính hóa đơn PAID: </Text>
                      <Switch
                        checked={onlyPaidRevenue}
                        onChange={(checked) => setOnlyPaidRevenue(checked)}
                      />
                    </Col>
                  </Row>
                  <Statistic
                    title="Tổng Doanh Thu"
                    value={revenue}
                    precision={0}
                    formatter={(value) => `${value.toLocaleString()} VNĐ`}
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: "#8B5A2B", fontSize: "28px" }} // Nâu đậm nhẹ
                  />
                  <Statistic
                    title={
                      <div style={{ marginBottom: "-10px" }}>Tổng Đơn Hàng</div>
                    }
                    value={totalInvoice}
                    precision={0}
                    prefix={
                      <IconTruckDelivery
                        style={{
                          width: "45px",
                          height: "32px",
                          marginTop: "12px",
                        }}
                      />
                    }
                    valueStyle={{
                      color: "#8B5A2B",
                      fontSize: "28px",
                      display: "flex",
                      alignItems: "center",
                    }} // Nâu đậm nhẹ
                  />
                </Card>
              </Col>

              {/* Status Statistics (Pie Chart) */}
              <Col xs={24} md={12}>
                <Card
                  title={
                    <span className={styles.chartTitle}>
                      Thống Kê Trạng Thái Hóa Đơn
                    </span>
                  }
                  className={styles.card}
                >
                  <div className={styles.chartContainer}>
                    {statusData.every((item) => item.value === 0) ? (
                      <Text>Không có dữ liệu</Text>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={statusData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ name, value }) => `${name}: ${value}`}
                            labelLine={true}
                            labelStyle={{ className: styles.chartPieLabel }}
                            isAnimationActive={true}
                            animationDuration={800}
                          >
                            {statusData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[entry.name]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => `${value} hóa đơn`}
                            wrapperClassName={styles.chartTooltip}
                            labelClassName={styles.chartLabel}
                          />
                          <Legend
                            wrapperStyle={{ className: styles.chartLegend }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </Card>
              </Col>

              {/* Top Products (Horizontal Bar Chart) */}
              <Col xs={24} md={12}>
                <Card
                  title={
                    <span className={styles.chartTitle}>
                      Top Sản Phẩm Bán Chạy
                    </span>
                  }
                  className={styles.card}
                >
                  <Row
                    justify="space-between"
                    align="middle"
                    style={{ marginBottom: 16 }}
                  >
                    <Col>
                      <Text strong>Chỉ tính hóa đơn PAID: </Text>
                      <Switch
                        checked={onlyPaidTopProducts}
                        onChange={(checked) => setOnlyPaidTopProducts(checked)}
                      />
                    </Col>
                    <Col>
                      <Text strong>Số lượng Top Sản Phẩm: </Text>
                      <InputNumber
                        min={1}
                        max={20}
                        value={topProductLimit}
                        onChange={(value) => setTopProductLimit(value)}
                      />
                    </Col>
                  </Row>
                  <div className={styles.chartContainer}>
                    {topProducts.length === 0 ? (
                      <Text>Không có dữ liệu</Text>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={topProducts}
                          layout="horizontal"
                          margin={{ top: 60, right: 30, left: 20, bottom: 10 }}
                        >
                          <defs>
                            <linearGradient
                              id="productGradient"
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="0"
                            >
                              <stop offset="0%" stopColor={COLORS.PRODUCT[0]} />
                              <stop
                                offset="100%"
                                stopColor={COLORS.PRODUCT[1]}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className={styles.chartGrid}
                          />
                          <XAxis
                            dataKey="revenue"
                            tickFormatter={(value) =>
                              `${(value / 1000000).toFixed(1)}M`
                            }
                            className={styles.chartAxis}
                          />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={150}
                            className={styles.chartAxis}
                          />
                          <Tooltip
                            formatter={(value) =>
                              `${value.toLocaleString()} VNĐ`
                            }
                            wrapperClassName={styles.chartTooltip}
                          />
                          <Bar
                            dataKey="revenue"
                            fill="url(#productGradient)"
                            barSize={20}
                            className={styles.chartBar}
                            isAnimationActive={true}
                            animationDuration={1000}
                          >
                            <LabelList content={<CustomBarLabel />} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </Card>
              </Col>

              {/* Top Customers (Horizontal Bar Chart) */}
              <Col xs={24} md={12}>
                <Card
                  title={
                    <span className={styles.chartTitle}>
                      Top Khách Hàng Chi Tiêu
                    </span>
                  }
                  className={styles.card}
                >
                  <Row
                    justify="space-between"
                    align="middle"
                    style={{ marginBottom: 16 }}
                  >
                    <Col>
                      <Text strong>Chỉ tính hóa đơn PAID: </Text>
                      <Switch
                        checked={onlyPaidTopCustomers}
                        onChange={(checked) => setOnlyPaidTopCustomers(checked)}
                      />
                    </Col>
                    <Col>
                      <Text strong>Số lượng Top Khách Hàng: </Text>
                      <InputNumber
                        min={1}
                        max={20}
                        value={topCustomerLimit}
                        onChange={(value) => setTopCustomerLimit(value)}
                      />
                    </Col>
                  </Row>
                  <div className={styles.chartContainer}>
                    {topCustomers.length === 0 ? (
                      <Text>Không có dữ liệu</Text>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={topCustomers}
                          layout="horizontal"
                          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className={styles.chartGrid}
                          />
                          <XAxis
                            dataKey="totalSpent"
                            tickFormatter={(value) =>
                              `${(value / 1000000).toFixed(1)}M`
                            }
                            className={styles.chartAxis}
                          />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={150}
                            className={styles.chartAxis}
                          />
                          <Tooltip
                            formatter={(value) =>
                              `${value.toLocaleString()} VNĐ`
                            }
                            wrapperClassName={styles.chartTooltip}
                          />
                          <Bar
                            dataKey="totalSpent"
                            fill={COLORS.PAID}
                            barSize={20}
                            className={styles.chartBar}
                            isAnimationActive={true}
                            animationDuration={1000}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </Card>
              </Col>

              {/* Payment Method Statistics (Stacked Bar Chart) */}
              <Col xs={24}>
                <Card
                  title={
                    <span className={styles.chartTitle}>
                      Doanh Thu Theo Phương Thức Thanh Toán
                    </span>
                  }
                  className={styles.card}
                >
                  <Row
                    justify="space-between"
                    align="middle"
                    style={{ marginBottom: 16 }}
                  >
                    <Col>
                      <Text strong>Chỉ tính hóa đơn PAID: </Text>
                      <Switch
                        checked={onlyPaidPaymentMethods}
                        onChange={(checked) =>
                          setOnlyPaidPaymentMethods(checked)
                        }
                      />
                    </Col>
                  </Row>
                  <div className={styles.chartContainer}>
                    {paymentMethods.length === 0 ? (
                      <Text>Không có dữ liệu</Text>
                    ) : (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={paymentMethods}
                          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className={styles.chartGrid}
                          />
                          <XAxis
                            dataKey="paymentMethod"
                            className={styles.chartAxis}
                          />
                          <YAxis
                            tickFormatter={(value) =>
                              `${(value / 1000000).toFixed(1)}M`
                            }
                            className={styles.chartAxis}
                          />
                          <Tooltip
                            formatter={(value) =>
                              `${value.toLocaleString()} VNĐ`
                            }
                            wrapperClassName={styles.chartTooltip}
                          />
                          <Legend
                            wrapperStyle={{ className: styles.chartLegend }}
                          />
                          <Bar
                            dataKey="PAID"
                            stackId="a"
                            fill={COLORS.PAID}
                            barSize={40}
                            className={styles.chartBar}
                            isAnimationActive={true}
                            animationDuration={1000}
                          />
                          <Bar
                            dataKey="PENDING"
                            stackId="a"
                            fill={COLORS.PENDING}
                            barSize={40}
                            className={styles.chartBar}
                            isAnimationActive={true}
                            animationDuration={1000}
                          />
                          <Bar
                            dataKey="CANCELLED"
                            stackId="a"
                            fill={COLORS.CANCELLED}
                            barSize={40}
                            className={styles.chartBar}
                            isAnimationActive={true}
                            animationDuration={1000}
                          />
                          <Bar
                            dataKey="FAILED"
                            stackId="a"
                            fill={COLORS.FAILED}
                            barSize={40}
                            className={styles.chartBar}
                            isAnimationActive={true}
                            animationDuration={1000}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </Card>
              </Col>

              {/* Invoice Count Statistics (Line Chart) */}
              <Col xs={24}>
                <Card
                  title={
                    <span className={styles.chartTitle}>Số Lượng Hóa Đơn</span>
                  }
                  className={styles.card}
                >
                  <Row
                    justify="space-between"
                    align="middle"
                    style={{ marginBottom: 16 }}
                  >
                    <Col>
                      <Text strong>Loại thống kê: </Text>
                      <Select
                        value={invoiceCountType}
                        onChange={(value) => setInvoiceCountType(value)}
                        style={{ width: 120 }}
                      >
                        <Option value="monthly">Theo tháng</Option>
                        <Option value="daily">Theo ngày</Option>
                      </Select>
                    </Col>
                    <Col>
                      <Text strong>Năm: </Text>
                      <InputNumber
                        min={2000}
                        max={moment().year() + 1}
                        value={selectedYear}
                        onChange={(value) => setSelectedYear(value)}
                      />
                    </Col>
                    {invoiceCountType === "daily" && (
                      <Col>
                        <Text strong>Tháng: </Text>
                        <Select
                          value={selectedMonth}
                          onChange={(value) => setSelectedMonth(value)}
                          style={{ width: 120 }}
                          placeholder="Chọn tháng"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (month) => (
                              <Option key={month} value={month}>
                                Tháng {month}
                              </Option>
                            ),
                          )}
                        </Select>
                      </Col>
                    )}
                  </Row>
                  <div className={styles.chartContainer}>
                    {invoiceCount.length === 0 ? (
                      <Text>Không có dữ liệu</Text>
                    ) : (
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart
                          data={invoiceCount}
                          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className={styles.chartGrid}
                          />
                          <XAxis
                            dataKey="period"
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            className={styles.chartAxis}
                          />
                          <YAxis className={styles.chartAxis} />
                          <Tooltip
                            formatter={(value) => `${value} hóa đơn`}
                            wrapperClassName={styles.chartTooltip}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke={COLORS.PAID}
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                            isAnimationActive={true}
                            animationDuration={1200}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminStatis;
