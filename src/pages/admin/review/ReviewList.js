import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Button,
  Pagination,
  Image,
  Tooltip,
  Table as AntTable,
  Switch,
  Select,
  Tabs,
  Card,
  Statistic,
  DatePicker,
  InputNumber,
  Progress,
  Rate,
} from "antd";
import Swal from "sweetalert2";
import Filter from "../../../components/admin/filter/Filter";
import config from "../../../config";
import {
  InfoOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import styles from "./index.module.scss";
import {
  getAllReviews,
  toggleHiddenReview,
  adminDeleteReview,
  getTopRatedProduct,
  getLowestRatedProduct,
  getMostReviewedProduct,
  getProductsByRating,
  getProductReviewStatistics,
} from "../../../services/api/reviewService";

const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// Hàm định dạng giá tiền
const formatPrice = (price) => {
  if (!price) return "N/A";
  return `${parseFloat(price).toLocaleString("vi-VN")} VNĐ`;
};

const AdminReviewList = () => {
  const [data, setData] = useState([]);
  const [validData, setValidData] = useState([]);
  const [filters, setFilters] = useState([]);
  const [checkedRow, setCheckedRow] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [currentReviewImages, setCurrentReviewImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isHiddenFilter, setIsHiddenFilter] = useState(undefined);
  const [productIdFilter, setProductIdFilter] = useState(undefined);
  const [userIdFilter, setUserIdFilter] = useState(undefined);
  const [ratingFilter, setRatingFilter] = useState(undefined);
  const [dateRangeFilter, setDateRangeFilter] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [topRatedProduct, setTopRatedProduct] = useState(null);
  const [lowestRatedProduct, setLowestRatedProduct] = useState(null);
  const [mostReviewedProduct, setMostReviewedProduct] = useState(null);
  const [productsByRating, setProductsByRating] = useState([]);
  const [productStatistics, setProductStatistics] = useState(null);
  const limit = config.LIMIT || 10;

  const standardSort = ["product.name", "createdAt"];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllReviews(
        currentPage,
        limit,
        isHiddenFilter,
        productIdFilter,
        userIdFilter,
      );
      if (res.error) {
        throw new Error(res.error);
      }
      let items = res?.reviews || [];

      if (ratingFilter !== undefined) {
        items = items.filter((item) => item.rating >= ratingFilter);
      }

      if (dateRangeFilter.length === 2) {
        const [startDate, endDate] = dateRangeFilter;
        items = items.filter((item) => {
          const createdAt = new Date(item.createdAt);
          return createdAt >= startDate && createdAt <= endDate;
        });
      }

      setData(items);
      setValidData(items);
      setTotal(res.total || 0);
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá:", error);
      setData([]);
      setValidData([]);
      Swal.fire({
        title: "Lỗi!",
        text: error.message || "Không thể tải danh sách đánh giá.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    limit,
    isHiddenFilter,
    productIdFilter,
    userIdFilter,
    ratingFilter,
    dateRangeFilter,
  ]);

  const fetchStatistics = useCallback(async () => {
    try {
      const topRated = await getTopRatedProduct();
      const lowestRated = await getLowestRatedProduct();
      const mostReviewed = await getMostReviewedProduct();
      const productsByRatingRes = await getProductsByRating("DESC", 1, 10);

      if (topRated.error) throw new Error(topRated.error);
      if (lowestRated.error) throw new Error(lowestRated.error);
      if (mostReviewed.error) throw new Error(mostReviewed.error);
      if (productsByRatingRes.error) throw new Error(productsByRatingRes.error);

      setTopRatedProduct(topRated);
      setLowestRatedProduct(lowestRated);
      setMostReviewedProduct(mostReviewed);
      setProductsByRating(productsByRatingRes.products || []);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê:", error);
      Swal.fire({
        title: "Lỗi!",
        text: error.message || "Không thể tải dữ liệu thống kê.",
        icon: "error",
      });
    }
  }, []);

  const fetchProductStatistics = async (productId) => {
    try {
      const res = await getProductReviewStatistics(productId);
      if (res.error) throw new Error(res.error);
      setProductStatistics(res);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê sản phẩm:", error);
      setProductStatistics(null);
      Swal.fire({
        title: "Lỗi!",
        text: error.message || "Không thể tải thống kê sản phẩm.",
        icon: "error",
      });
    }
  };

  const handleDeleteReview = async () => {
    if (!Array.isArray(checkedRow) || checkedRow.length === 0) {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng chọn ít nhất một đánh giá để xóa.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      setLoading(true);
      try {
        await Promise.all(checkedRow.map((id) => adminDeleteReview(id)));
        Swal.fire({
          title: "Đã xóa!",
          text: "Đánh giá đã được xóa thành công.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchData();
        setCheckedRow([]);
      } catch (error) {
        Swal.fire({
          title: "Lỗi!",
          text: error.message || "Đã xảy ra lỗi khi xóa đánh giá.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleHidden = async (id, isHidden) => {
    setLoading(true);
    try {
      const res = await toggleHiddenReview(id);
      if (res.error) {
        throw new Error(res.error);
      }
      Swal.fire({
        title: isHidden ? "Đã ẩn!" : "Đã hiển thị!",
        text: `Đánh giá đã được ${isHidden ? "ẩn" : "hiển thị"} thành công.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchData();
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text:
          error.message || "Đã xảy ra lỗi khi cập nhật trạng thái đánh giá.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (review) => {
    setCurrentReview(review);
    setCurrentReviewImages(review.images || []);
    await fetchProductStatistics(review.productId);
    setDetailModalVisible(true);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  useEffect(() => {
    setFilters([
      {
        key: "product.name",
        header: "Tên sản phẩm",
        options: [
          "Tất cả",
          ...new Set(data.map((item) => item.product?.name).filter(Boolean)),
        ],
      },
      {
        key: "createdAt",
        header: "Ngày tạo",
        options: [
          "Tất cả",
          ...new Set(
            data
              .map((item) => new Date(item.createdAt).toLocaleDateString())
              .filter(Boolean),
          ),
        ],
      },
    ]);
  }, [data]);

  const reviewColumns = [
    {
      title: "Bình luận",
      key: "comment",
      render: (record) => record.comment || "N/A",
      width: 500,
    },
    {
      title: "Ngày tạo",
      key: "createdAt",
      render: (record) =>
        record.createdAt
          ? new Date(record.createdAt).toLocaleDateString()
          : "N/A",
      width: 150,
    },
    {
      title: "Trạng thái",
      key: "isHidden",
      render: (record) => (
        <Switch
          checkedChildren={<EyeOutlined />}
          unCheckedChildren={<EyeInvisibleOutlined />}
          checked={!record.isHidden}
          onChange={(checked) => handleToggleHidden(record.id, !checked)}
        />
      ),
      width: 120,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<InfoOutlined />}
              onClick={() => handleViewDetails(record)}
              style={{ border: "none", color: "#1890ff" }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => {
                setCheckedRow([record.id]);
                handleDeleteReview();
              }}
              style={{ border: "none", color: "#ff4d4f" }}
            />
          </Tooltip>
        </div>
      ),
      width: 120,
    },
  ];

  const productsByRatingColumns = [
    {
      title: "Hình ảnh",
      key: "images",
      render: (record) => (
        <div className={styles.productImage}>
          {record.images && record.images.length > 0 ? (
            <Image
              src={record.images[0].fileUrl}
              alt="Product Image"
              width={50}
              height={50}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <span>Không có hình ảnh</span>
          )}
        </div>
      ),
      width: 100,
    },
    {
      title: "Sản phẩm",
      key: "product.name",
      render: (record) => record.product?.name || "N/A",
      width: 300,
    },
    {
      title: "Đánh giá trung bình",
      key: "averageRating",
      render: (record) => (
        <Rate
          disabled
          value={Math.round(record.averageRating)}
          style={{ color: "#fadb14", fontSize: 20 }}
        />
      ),
      width: 200,
    },
    {
      title: "Số lượng đánh giá",
      key: "totalReviews",
      render: (record) => record.totalReviews || 0,
      width: 150,
    },
    {
      title: "Giá tiền",
      key: "finalPrice",
      render: (record) => formatPrice(record.product?.finalPrice),
      width: 150,
    },
  ];

  return (
    <div className={styles.wrapper}>
      <header className={styles.adminHeader}>
        <div className={styles.container}>
          <h2>QUẢN LÝ ĐÁNH GIÁ</h2>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.container}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Danh sách đánh giá" key="1">
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTools}>
                    {/* Hàng 1: Bộ lọc tìm kiếm và sắp xếp */}
                    <div className={styles.filterRow}>
                      <Filter
                        filters={filters}
                        data={data}
                        validData={validData}
                        setValidData={setValidData}
                        standardSort={[
                          { name: "Bình luận", type: "comment" },
                        ]}
                        searchFields={[
                          {
                            key: "comment",
                            placeholder: "Tìm kiếm theo bình luận",
                          },
                        ]}
                      />
                    </div>
                    {/* Hàng 2: Các bộ lọc trạng thái, sản phẩm, rating, ngày */}
                    <div className={styles.filterRow}>
                      <Select
                        style={{ width: 200 }}
                        placeholder="Lọc theo trạng thái"
                        allowClear
                        onChange={(value) => {
                          setIsHiddenFilter(value);
                          setCurrentPage(1);
                        }}
                      >
                        <Option value={true}>Ẩn</Option>
                        <Option value={false}>Hiển thị</Option>
                      </Select>
                      <Select
                        style={{ width: 200 }}
                        placeholder="Lọc theo sản phẩm"
                        allowClear
                        onChange={(value) => {
                          setProductIdFilter(value);
                          setCurrentPage(1);
                        }}
                      >
                        {[...new Set(data.map((item) => item.productId))].map(
                          (productId) => (
                            <Option key={productId} value={productId}>
                              {data.find((item) => item.productId === productId)
                                ?.product?.name || productId}
                            </Option>
                          ),
                        )}
                      </Select>
                      <InputNumber
                        style={{ width: 200 }}
                        placeholder="Lọc theo rating (tối thiểu)"
                        min={1}
                        max={5}
                        onChange={(value) => {
                          setRatingFilter(value);
                          setCurrentPage(1);
                        }}
                      />
                      <RangePicker
                        onChange={(dates) => {
                          setDateRangeFilter(dates || []);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.cardBtns}>
                    <Button
                      danger
                      onClick={handleDeleteReview}
                      disabled={!checkedRow.length}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <AntTable
                    dataSource={validData}
                    columns={reviewColumns}
                    rowKey={(record) => record.id}
                    pagination={false}
                    rowSelection={{
                      selectedRowKeys: checkedRow,
                      onChange: (selectedRowKeys) =>
                        setCheckedRow(selectedRowKeys),
                    }}
                    loading={loading}
                    className={styles.table}
                    scroll={{ x: "max-content" }}
                  />
                </div>
                {total > limit && (
                  <div className={styles.pagination}>
                    <Pagination
                      current={currentPage}
                      pageSize={limit}
                      total={total}
                      onChange={(page) => setCurrentPage(page)}
                    />
                  </div>
                )}
              </div>
            </TabPane>
            <TabPane tab="Thống kê" key="2">
              <div className={styles.statisticsSection}>
                <div className={styles.gridContainer}>
                  <Card title="Sản phẩm được đánh giá cao nhất">
                    {topRatedProduct ? (
                      <div>
                        {topRatedProduct.images &&
                        topRatedProduct.images.length > 0 ? (
                          <div className={styles.productImage}>
                            <Image
                              src={topRatedProduct.images[0].fileUrl}
                              alt="Product Image"
                              width={100}
                              height={100}
                              style={{ objectFit: "cover", marginBottom: 16 }}
                            />
                          </div>
                        ) : (
                          <p>Không có hình ảnh</p>
                        )}
                        <p>
                          <strong>Tên sản phẩm:</strong>{" "}
                          {topRatedProduct.product?.name || "N/A"}
                        </p>
                        <div className={styles.ratingCircle}>
                          <Progress
                            type="circle"
                            percent={(topRatedProduct.averageRating / 5) * 100}
                            format={() =>
                              `${topRatedProduct.averageRating.toFixed(2)}/5`
                            }
                            strokeColor="#fadb14"
                            width={100}
                            clockwise={false}
                          />
                        </div>
                        <p>
                          <strong>Số lượng đánh giá:</strong>{" "}
                          {topRatedProduct.totalReviews}
                        </p>
                        <p>
                          <strong>Giá tiền:</strong>{" "}
                          {formatPrice(topRatedProduct.product?.finalPrice)}
                        </p>
                      </div>
                    ) : (
                      <p>Không có dữ liệu</p>
                    )}
                  </Card>
                  <Card title="Sản phẩm được đánh giá thấp nhất">
                    {lowestRatedProduct ? (
                      <div>
                        {lowestRatedProduct.images &&
                        lowestRatedProduct.images.length > 0 ? (
                          <div className={styles.productImage}>
                            <Image
                              src={lowestRatedProduct.images[0].fileUrl}
                              alt="Product Image"
                              width={100}
                              height={100}
                              style={{ objectFit: "cover", marginBottom: 16 }}
                            />
                          </div>
                        ) : (
                          <p>Không có hình ảnh</p>
                        )}
                        <p>
                          <strong>Tên sản phẩm:</strong>{" "}
                          {lowestRatedProduct.product?.name || "N/A"}
                        </p>
                        <div className={styles.ratingCircle}>
                          <Progress
                            type="circle"
                            percent={
                              (lowestRatedProduct.averageRating / 5) * 100
                            }
                            format={() =>
                              `${lowestRatedProduct.averageRating.toFixed(2)}/5`
                            }
                            strokeColor="#fadb14"
                            width={100}
                            clockwise={false}
                          />
                        </div>
                        <p>
                          <strong>Số lượng đánh giá:</strong>{" "}
                          {lowestRatedProduct.totalReviews}
                        </p>
                        <p>
                          <strong>Giá tiền:</strong>{" "}
                          {formatPrice(lowestRatedProduct.product?.finalPrice)}
                        </p>
                      </div>
                    ) : (
                      <p>Không có dữ liệu</p>
                    )}
                  </Card>
                  <Card title="Sản phẩm có nhiều đánh giá nhất">
                    {mostReviewedProduct ? (
                      <div>
                        {mostReviewedProduct.images &&
                        mostReviewedProduct.images.length > 0 ? (
                          <div className={styles.productImage}>
                            <Image
                              src={mostReviewedProduct.images[0].fileUrl}
                              alt="Product Image"
                              width={100}
                              height={100}
                              style={{ objectFit: "cover", marginBottom: 16 }}
                            />
                          </div>
                        ) : (
                          <p>Không có hình ảnh</p>
                        )}
                        <p>
                          <strong>Tên sản phẩm:</strong>{" "}
                          {mostReviewedProduct.product?.name || "N/A"}
                        </p>
                        <p>
                          <strong>Số lượng đánh giá:</strong>{" "}
                          {mostReviewedProduct.totalReviews}
                        </p>
                        <p>
                          <strong>Giá tiền:</strong>{" "}
                          {formatPrice(mostReviewedProduct.product?.finalPrice)}
                        </p>
                      </div>
                    ) : (
                      <p>Không có dữ liệu</p>
                    )}
                  </Card>
                </div>

                <div className={styles.tableContainer}>
                  <Card title="Danh sách sản phẩm theo thứ tự đánh giá">
                    <AntTable
                      dataSource={productsByRating}
                      columns={productsByRatingColumns}
                      rowKey={(record) => record.product?.id || Math.random()}
                      pagination={false}
                      className={styles.table}
                      scroll={{ x: "max-content" }}
                    />
                  </Card>
                </div>
              </div>
            </TabPane>
          </Tabs>

          <Modal
            title="Chi tiết đánh giá"
            open={detailModalVisible}
            onCancel={() => {
              setDetailModalVisible(false);
              setCurrentReview(null);
              setCurrentReviewImages([]);
              setProductStatistics(null);
            }}
            footer={null}
            className={styles.reviewDetailModal}
            width={900}
          >
            {currentReview ? (
              <div className={styles.reviewDetailContent}>
                <div className={styles.reviewInfo}>
                  <h3>Tên sản phẩm: {currentReview.product?.name || "N/A"}</h3>
                  <p>
                    <strong>Rating:</strong>{" "}
                    <Rate
                      disabled
                      value={currentReview.rating}
                      style={{ color: "#fadb14", fontSize: 24 }}
                    />
                  </p>
                  <p>
                    <strong>Bình luận:</strong> {currentReview.comment}
                  </p>
                  <p>
                    <strong>Ngày tạo:</strong>{" "}
                    {new Date(currentReview.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    {currentReview.isHidden ? "Ẩn" : "Hiển thị"}
                  </p>
                </div>
                {productStatistics && (
                  <div className={styles.statisticsSection}>
                    <h3>Thống kê đánh giá sản phẩm</h3>
                    <div className={styles.ratingCircle}>
                      <Progress
                        type="circle"
                        percent={(productStatistics.averageRating / 5) * 100}
                        format={() =>
                          `${productStatistics.averageRating.toFixed(2)}/5`
                        }
                        strokeColor="#fadb14"
                        width={120}
                        clockwise={false}
                      />
                    </div>
                    <Statistic
                      title="Số lượng đánh giá"
                      value={productStatistics.totalReviews}
                    />
                    <div className={styles.ratingDistribution}>
                      <h4>Phân bố đánh giá:</h4>
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div
                          key={star}
                          className={styles.ratingDistributionItem}
                        >
                          <Rate
                            disabled
                            value={star}
                            style={{
                              color: "#fadb14",
                              fontSize: 20,
                              marginRight: 8,
                            }}
                          />
                          <span>
                            {productStatistics.ratingDistribution?.[star] || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {currentReviewImages.length > 0 && (
                  <div className={styles.imageSection}>
                    <h3>Hình ảnh</h3>
                    <div className={styles.imageList}>
                      {currentReviewImages.map((image) => (
                        <Image
                          key={image.fileId}
                          src={image.fileUrl}
                          alt="Review Image"
                          width={150}
                          height={150}
                          style={{ objectFit: "cover" }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p>Không có dữ liệu đánh giá</p>
            )}
          </Modal>
        </div>
      </main>
    </div>
  );
};

export default AdminReviewList;
