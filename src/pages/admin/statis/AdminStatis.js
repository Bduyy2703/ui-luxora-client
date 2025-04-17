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
  InputNumber,
  Button,
  Switch,
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
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
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
import { IconTruckDelivery } from "@tabler/icons-react";
import styles from "./statistics.module.scss";
import { getProductDetailsByIdDetails } from "../../../services/api/productDetailService";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminStatis = () => {
  const [dateRange, setDateRange] = useState([
    moment("2025-01-01"),
    moment("2026-01-01"),
  ]);
  const [revenue, setRevenue] = useState(0);
  const [totalInvoice, setTotalInvoice] = useState(0);
  const [statusData, setStatusData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [invoiceCount, setInvoiceCount] = useState([]);
  const [loading, setLoading] = useState(false);

  const [onlyPaidRevenue, setOnlyPaidRevenue] = useState(true);
  const [onlyPaidTopProducts, setOnlyPaidTopProducts] = useState(true);
  const [onlyPaidTopCustomers, setOnlyPaidTopCustomers] = useState(true);
  const [onlyPaidPaymentMethods, setOnlyPaidPaymentMethods] = useState(true);

  const [topProductLimit, setTopProductLimit] = useState(5);
  const [topCustomerLimit, setTopCustomerLimit] = useState(5);
  const [invoiceCountType, setInvoiceCountType] = useState("daily");
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(9);

  const [showTopProducts, setShowTopProducts] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [growthRate, setGrowthRate] = useState(0);
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [conversionRate, setConversionRate] = useState(0);
  const [productImages, setProductImages] = useState({}); // Lưu URL hình ảnh theo productDetailId

  const COLORS = {
    PAID: "#A0DFFF",
    PENDING: "#B0A0FF",
    CANCELLED: "#FFBAD2",
    FAILED: "#FFD8A0",
    PRODUCT: ["#6B5BFF", "#00C4FF"],
  };

  const fetchData = async () => {
    setLoading(true);
    const startDate = dateRange[0];
    const endDate = dateRange[1];

    try {
      // Lấy KPI: Doanh Thu và Tổng Đơn Hàng
      const revenueRes = await getInvoiceRevenue(
        startDate,
        endDate,
        onlyPaidRevenue,
      );
      setRevenue(revenueRes.revenue || 0);
      setTotalInvoice(revenueRes.totalInvoice || 0);

      // Lấy trạng thái hóa đơn và tính tỷ lệ chuyển đổi
      const statusRes = await getStatusStatistics(startDate, endDate);
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

      const paidOrders =
        statusDataMapped.find((item) => item.name === "PAID")?.value || 0;
      const totalOrders = statusDataMapped.reduce(
        (sum, item) => sum + item.value,
        0,
      );
      const calculatedConversionRate =
        totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(2) : 0;
      setConversionRate(calculatedConversionRate);

      // Lấy top sản phẩm
      const topProductsRes = await getTopProducts(
        startDate,
        endDate,
        topProductLimit,
        onlyPaidTopProducts,
      );
      console.log("Top Products Data:", topProductsRes); // Debug dữ liệu
      const mappedTopProducts = topProductsRes.map((item) => ({
        name: `${item.productName} (ID: ${item.productDetailId})`,
        revenue: item.totalRevenue || 0,
        productDetailId: item.productDetailId,
      }));
      setTopProducts(mappedTopProducts);

      // Lấy hình ảnh sản phẩm
      const imagePromises = mappedTopProducts.map(async (product) => {
        const idMatch = product.name.match(/ID: (\d+)/);
        const productDetailId = idMatch ? parseInt(idMatch[1]) : null;
        if (productDetailId) {
          try {
            const productData =
              await getProductDetailsByIdDetails(productDetailId);
            const imageUrl = productData?.images?.[0]?.fileUrl || "";
            return { productDetailId, imageUrl };
          } catch (error) {
            console.error(
              `Error fetching image for product ID ${productDetailId}:`,
              error,
            );
            return { productDetailId, imageUrl: "" };
          }
        }
        return { productDetailId: null, imageUrl: "" };
      });

      const images = await Promise.all(imagePromises);
      const imageMap = images.reduce((acc, { productDetailId, imageUrl }) => {
        if (productDetailId) acc[productDetailId] = imageUrl;
        return acc;
      }, {});
      setProductImages(imageMap);

      // Lấy top khách hàng
      const topCustomersRes = await getTopCustomers(
        startDate,
        endDate,
        topCustomerLimit,
        onlyPaidTopCustomers,
      );
      console.log("Top Customers Data:", topCustomersRes); // Debug dữ liệu
      const mappedTopCustomers = topCustomersRes.map((item) => ({
        name: item.username || "Unknown",
        totalSpent: item.totalSpent || 0,
      }));
      setTopCustomers(mappedTopCustomers);

      // Lấy doanh thu theo phương thức thanh toán
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

      const total = paymentData.reduce((sum, item) => {
        return (
          sum +
          (item.PAID || 0) +
          (item.PENDING || 0) +
          (item.CANCELLED || 0) +
          (item.FAILED || 0)
        );
      }, 0);
      setTotalRevenue(total);

      // Lấy số lượng hóa đơn
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

      // Tính doanh thu theo tháng
      const monthlyRevenue = [];
      for (let month = 0; month < 12; month++) {
        const monthStart = moment(
          `${selectedYear}-${month + 1}-01`,
          "YYYY-MM-DD",
        ).startOf("month");
        const monthEnd = moment(
          `${selectedYear}-${month + 1}-01`,
          "YYYY-MM-DD",
        ).endOf("month");
        const monthRevenueRes = await getInvoiceRevenue(
          monthStart,
          monthEnd,
          onlyPaidRevenue,
        );
        monthlyRevenue.push({
          month: moment().month(month).format("MMM"),
          revenue: monthRevenueRes.revenue || 0,
        });
      }
      setRevenueByMonth(monthlyRevenue);

      // Tính tỷ lệ tăng trưởng dựa trên 2 tháng gần nhất
      if (monthlyRevenue.length >= 2) {
        const lastMonthRevenue =
          monthlyRevenue[monthlyRevenue.length - 1].revenue;
        const prevMonthRevenue =
          monthlyRevenue[monthlyRevenue.length - 2].revenue;
        const calculatedGrowthRate =
          prevMonthRevenue > 0
            ? (
                ((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue) *
                100
              ).toFixed(2)
            : 0;
        setGrowthRate(calculatedGrowthRate);
      } else {
        setGrowthRate(0);
      }
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

  // Tính phần trăm cho từng trạng thái thanh toán
  const enhancedPaymentData = paymentMethods.map((item) => {
    const totalForMethod =
      (item.PAID || 0) +
      (item.PENDING || 0) +
      (item.CANCELLED || 0) +
      (item.FAILED || 0);
    return {
      ...item,
      PAID_PERCENT: totalRevenue
        ? (((item.PAID || 0) / totalRevenue) * 100).toFixed(1)
        : 0,
      PENDING_PERCENT: totalRevenue
        ? (((item.PENDING || 0) / totalRevenue) * 100).toFixed(1)
        : 0,
      CANCELLED_PERCENT: totalRevenue
        ? (((item.CANCELLED || 0) / totalRevenue) * 100).toFixed(1)
        : 0,
      FAILED_PERCENT: totalRevenue
        ? (((item.FAILED || 0) / totalRevenue) * 100).toFixed(1)
        : 0,
    };
  });

  const handleBarClick = (data) => {
    console.log("Chi tiết:", data);
  };

  // Custom label để hiển thị hình ảnh phía trên cột
  const CustomBarLabel = (props) => {
    const { x, y, width, height, value, index } = props;
    const product = (showTopProducts ? topProducts : topCustomers)[index];
    const idMatch = product.name.match(/ID: (\d+)/);
    const productDetailId = idMatch ? parseInt(idMatch[1]) : null;
    const imageUrl = productDetailId ? productImages[productDetailId] : "";

    if (!imageUrl) return null;

    return (
      <g>
        <image
          x={x + width / 2 - 12} // Căn giữa hình ảnh trên cột
          y={y - 30} // Đặt phía trên cột
          width={24}
          height={24}
          href={imageUrl}
          style={{ borderRadius: "4px" }}
        />
      </g>
    );
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#FFFFFF" }}>
      <Sider width={200} className={styles.sider}>
        <div className={styles.logo}>
          <Title level={4} style={{ color: "#FFFFFF", margin: 0 }}>
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
        <Header className={styles.header}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingLeft: "50px",
            }}
          >
            <Title level={3} style={{ color: "#1A1A1A", margin: 0 }}>
              Tổng Quan
            </Title>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              format="YYYY-MM-DD"
              className={styles.datePicker}
            />
          </div>
        </Header>

        <Content className={styles.content}>
          <Spin
            spinning={loading}
            indicator={<div className={styles.spinner} />}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <Card className={styles.kpiCard}>
                    <Statistic
                      title={<span className={styles.kpiTitle}>Doanh Thu</span>}
                      value={revenue}
                      precision={0}
                      formatter={(value) =>
                        `${(value / 1000000).toFixed(1)}M VNĐ`
                      }
                      valueStyle={{ color: "#6B5BFF", fontSize: "24px" }}
                    />
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} md={6}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring", delay: 0.1 }}
                >
                  <Card className={styles.kpiCard}>
                    <Statistic
                      title={
                        <span className={styles.kpiTitle}>Tổng Đơn Hàng</span>
                      }
                      value={totalInvoice}
                      precision={0}
                      valueStyle={{ color: "#6B5BFF", fontSize: "24px" }}
                    />
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} md={6}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring", delay: 0.2 }}
                >
                  <Card className={styles.kpiCard}>
                    <Statistic
                      title={
                        <span className={styles.kpiTitle}>
                          Lợi Nhuận Gộp 75%
                        </span>
                      }
                      value={revenue * 0.75}
                      precision={0}
                      formatter={(value) =>
                        `${(value / 1000000).toFixed(1)}M VNĐ`
                      }
                      valueStyle={{ color: "#6B5BFF", fontSize: "24px" }}
                    />
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} md={6}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring", delay: 0.3 }}
                >
                  <Card className={styles.kpiCard}>
                    <Statistic
                      title={
                        <span className={styles.kpiTitle}>
                          Tỷ Lệ Chuyển Đổi
                        </span>
                      }
                      value={conversionRate}
                      precision={2}
                      suffix="%"
                      valueStyle={{ color: "#6B5BFF", fontSize: "24px" }}
                    />
                  </Card>
                </motion.div>
              </Col>

              <Col xs={24} md={8}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring", delay: 0.4 }}
                >
                  <Card
                    title={
                      <span className={styles.chartTitle}>
                        Trạng Thái Hóa Đơn
                      </span>
                    }
                    className={styles.card}
                  >
                    <div className={styles.chartContainer}>
                      {statusData.every((item) => item.value === 0) ? (
                        <Text className={styles.statText}>
                          Không có dữ liệu
                        </Text>
                      ) : (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={statusData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ name, value }) => `${name}: ${value}`}
                              labelLine={true}
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
                            />
                            <Legend
                              wrapperStyle={{ className: styles.chartLegend }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </Col>

              <Col xs={24} md={16}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring", delay: 0.6 }}
                >
                  <Card
                    title={
                      <span className={styles.chartTitle}>
                        Doanh Thu Theo Tháng
                      </span>
                    }
                    className={styles.card}
                  >
                    <div className={styles.chartContainer}>
                      {revenueByMonth.length === 0 ? (
                        <Text className={styles.statText}>
                          Không có dữ liệu
                        </Text>
                      ) : (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart
                            data={revenueByMonth}
                            margin={{
                              top: 10,
                              right: 30,
                              left: 20,
                              bottom: 10,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              className={styles.chartGrid}
                            />
                            <XAxis
                              dataKey="month"
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
                                `${(value / 1000000).toFixed(1)}M VNĐ`
                              }
                              wrapperClassName={styles.chartTooltip}
                            />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              stroke="#6B5BFF"
                              strokeWidth={3}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                              isAnimationActive={true}
                              animationDuration={1200}
                            >
                              {revenueByMonth.map((entry, index) => (
                                <motion.circle
                                  key={`dot-${index}`}
                                  cx={entry.cx}
                                  cy={entry.cy}
                                  r={4}
                                  fill="#6B5BFF"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: [1, 1.5, 1] }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 2,
                                    delay: index * 0.2,
                                  }}
                                />
                              ))}
                            </Line>
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </Col>

              <Col xs={24} md={12}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring", delay: 0.8 }}
                >
                  <Card
                    title={
                      <span className={styles.chartTitle}>
                        {showTopProducts
                          ? "Top Sản Phẩm Bán Chạy"
                          : "Top Khách Hàng Chi Tiêu"}
                      </span>
                    }
                    className={styles.card}
                    extra={
                      <Button
                        type="primary"
                        onClick={() => setShowTopProducts(!showTopProducts)}
                        className={styles.switchButton}
                      >
                        {showTopProducts
                          ? "Xem Top Người Dùng"
                          : "Xem Top Sản Phẩm"}
                      </Button>
                    }
                  >
                    <Row
                      justify="space-between"
                      align="middle"
                      style={{ marginBottom: 16 }}
                    >
                      <Col>
                        <Text strong className={styles.statText}>
                          Chỉ tính hóa đơn PAID:{" "}
                        </Text>
                        <Switch
                          checked={
                            showTopProducts
                              ? onlyPaidTopProducts
                              : onlyPaidTopCustomers
                          }
                          onChange={(checked) =>
                            showTopProducts
                              ? setOnlyPaidTopProducts(checked)
                              : setOnlyPaidTopCustomers(checked)
                          }
                        />
                      </Col>
                      <Col>
                        <Text strong className={styles.statText}>
                          Số lượng{" "}
                          {showTopProducts ? "Top Sản Phẩm" : "Top Khách Hàng"}:
                        </Text>
                        <InputNumber
                          min={1}
                          max={20}
                          value={
                            showTopProducts ? topProductLimit : topCustomerLimit
                          }
                          onChange={(value) =>
                            showTopProducts
                              ? setTopProductLimit(value)
                              : setTopCustomerLimit(value)
                          }
                        />
                      </Col>
                    </Row>
                    <div className={styles.chartContainer}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={showTopProducts ? "topProducts" : "topCustomers"}
                          initial={{ rotateY: 90, opacity: 0 }}
                          animate={{ rotateY: 0, opacity: 1 }}
                          exit={{ rotateY: -90, opacity: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          {(showTopProducts ? topProducts : topCustomers)
                            .length === 0 ? (
                            <Text className={styles.statText}>
                              Không có dữ liệu
                            </Text>
                          ) : (
                            <ResponsiveContainer width="100%" height={350}>
                              <BarChart
                                data={
                                  showTopProducts ? topProducts : topCustomers
                                }
                                layout="horizontal"
                                margin={{
                                  top: 40,
                                  right: 30,
                                  left: 20,
                                  bottom: 10,
                                }}
                              >
                                <defs>
                                  <linearGradient
                                    id="productGradient"
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="0"
                                  >
                                    <stop
                                      offset="0%"
                                      stopColor={COLORS.PRODUCT[0]}
                                    />
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
                                  dataKey={
                                    showTopProducts ? "revenue" : "totalSpent"
                                  }
                                  tickFormatter={(value) =>
                                    `${(value / 1000000).toFixed(1)}M`
                                  }
                                  className={styles.chartAxis}
                                />
                                <YAxis
                                  dataKey="name"
                                  type="category"
                                  width={180}
                                  className={styles.chartAxis}
                                />
                                <Tooltip
                                  formatter={(value) =>
                                    `${(value / 1000000).toFixed(1)}M VNĐ`
                                  }
                                  wrapperClassName={styles.chartTooltip}
                                />
                                <Bar
                                  dataKey={
                                    showTopProducts ? "revenue" : "totalSpent"
                                  }
                                  fill="url(#productGradient)"
                                  barSize={20}
                                  onClick={handleBarClick}
                                >
                                  <LabelList
                                    dataKey="revenue"
                                    position="top"
                                    content={CustomBarLabel}
                                  />
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </Card>
                </motion.div>
              </Col>

              <Col xs={24} md={12}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring", delay: 1 }}
                >
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
                        <Text strong className={styles.statText}>
                          Chỉ tính hóa đơn PAID:{" "}
                        </Text>
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
                        <Text className={styles.statText}>
                          Không có dữ liệu
                        </Text>
                      ) : (
                        <>
                          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                              <Text className={styles.statText}>
                                Tổng Doanh Thu:{" "}
                                {(totalRevenue / 1000000).toFixed(1)}M VNĐ
                              </Text>
                            </Col>
                            <Col span={12}>
                              <Text className={styles.statText}>
                                Tăng trưởng: {growthRate}%
                              </Text>
                            </Col>
                          </Row>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                              data={enhancedPaymentData}
                              margin={{
                                top: 10,
                                right: 30,
                                left: 20,
                                bottom: 10,
                              }}
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
                                formatter={(value, name, props) => {
                                  const percentKey = `${name}_PERCENT`;
                                  return [
                                    `${(value / 1000000).toFixed(1)}M VNĐ`,
                                    `${name}: ${props.payload[percentKey]}%`,
                                  ];
                                }}
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
                                onClick={handleBarClick}
                              >
                                {enhancedPaymentData.map((entry, index) => (
                                  <motion.g
                                    key={`bar-paid-${index}`}
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{
                                      duration: 1,
                                      delay: index * 0.2,
                                    }}
                                  >
                                    <Bar
                                      className={styles.chartBar}
                                      style={{ transform: "rotateX(45deg)" }}
                                    />
                                  </motion.g>
                                ))}
                              </Bar>
                              <Bar
                                dataKey="PENDING"
                                stackId="a"
                                fill={COLORS.PENDING}
                                barSize={40}
                                onClick={handleBarClick}
                              >
                                {enhancedPaymentData.map((entry, index) => (
                                  <motion.g
                                    key={`bar-pending-${index}`}
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{
                                      duration: 1,
                                      delay: index * 0.2 + 0.1,
                                    }}
                                  >
                                    <Bar
                                      className={styles.chartBar}
                                      style={{ transform: "rotateX(45deg)" }}
                                    />
                                  </motion.g>
                                ))}
                              </Bar>
                              <Bar
                                dataKey="CANCELLED"
                                stackId="a"
                                fill={COLORS.CANCELLED}
                                barSize={40}
                                onClick={handleBarClick}
                              >
                                {enhancedPaymentData.map((entry, index) => (
                                  <motion.g
                                    key={`bar-cancelled-${index}`}
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{
                                      duration: 1,
                                      delay: index * 0.2 + 0.2,
                                    }}
                                  >
                                    <Bar
                                      className={styles.chartBar}
                                      style={{ transform: "rotateX(45deg)" }}
                                    />
                                  </motion.g>
                                ))}
                              </Bar>
                              <Bar
                                dataKey="FAILED"
                                stackId="a"
                                fill={COLORS.FAILED}
                                barSize={40}
                                onClick={handleBarClick}
                              >
                                {enhancedPaymentData.map((entry, index) => (
                                  <motion.g
                                    key={`bar-failed-${index}`}
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{
                                      duration: 1,
                                      delay: index * 0.2 + 0.3,
                                    }}
                                  >
                                    <Bar
                                      className={styles.chartBar}
                                      style={{ transform: "rotateX(45deg)" }}
                                    />
                                  </motion.g>
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </Col>

              <Col xs={24}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring", delay: 1.2 }}
                >
                  <Card
                    title={
                      <span className={styles.chartTitle}>
                        Số Lượng Hóa Đơn
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
                        <Text strong className={styles.statText}>
                          Loại thống kê:{" "}
                        </Text>
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
                        <Text strong className={styles.statText}>
                          Năm:{" "}
                        </Text>
                        <InputNumber
                          min={2000}
                          max={moment().year() + 1}
                          value={selectedYear}
                          onChange={(value) => setSelectedYear(value)}
                        />
                      </Col>
                      {invoiceCountType === "daily" && (
                        <Col>
                          <Text strong className={styles.statText}>
                            Tháng:{" "}
                          </Text>
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
                        <Text className={styles.statText}>
                          Không có dữ liệu
                        </Text>
                      ) : (
                        <ResponsiveContainer width="100%" height={350}>
                          <LineChart
                            data={invoiceCount}
                            margin={{
                              top: 10,
                              right: 30,
                              left: 20,
                              bottom: 10,
                            }}
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
                              stroke="#6B5BFF"
                              strokeWidth={3}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                              isAnimationActive={true}
                              animationDuration={1200}
                            >
                              {invoiceCount.map((entry, index) => (
                                <motion.circle
                                  key={`dot-${index}`}
                                  cx={entry.cx}
                                  cy={entry.cy}
                                  r={4}
                                  fill="#6B5BFF"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: [1, 1.5, 1] }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 2,
                                    delay: index * 0.2,
                                  }}
                                />
                              ))}
                            </Line>
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminStatis;
