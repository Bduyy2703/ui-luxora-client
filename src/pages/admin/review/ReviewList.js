// src/pages/admin/review/ReviewList.js
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
} from "antd";
import Swal from "sweetalert2";
import Filter from "../../../components/admin/filter/Filter";
import config from "../../../config";
import { InfoOutlined, DeleteOutlined, EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import styles from "./index.module.scss";
import {
  getAllReviews,
  toggleHiddenReview,
  adminDeleteReview,
  getReviewsByProductId,
  getTopRatedProduct,
  getLowestRatedProduct,
  getMostReviewedProduct,
  getProductsByRating,
  getProductReviewStatistics,
} from "../../../services/api/reviewService";

const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

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

  const standardSort = ["productName", "createdAt"];

  // Lấy danh sách đánh giá
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllReviews(
        currentPage,
        limit,
        isHiddenFilter,
        productIdFilter,
        userIdFilter
      );
      if (res.error) {
        throw new Error(res.error);
      }
      let items = res?.reviews || [];
      
      // Lọc theo rating
      if (ratingFilter !== undefined) {
        items = items.filter((item) => item.rating >= ratingFilter);
      }

      // Lọc theo khoảng thời gian
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
      console.error("Error fetching reviews:", error);
      setData([]);
      setValidData([]);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải danh sách đánh giá.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, isHiddenFilter, productIdFilter, userIdFilter, ratingFilter, dateRangeFilter]);

  // Lấy dữ liệu thống kê
  const fetchStatistics = useCallback(async () => {
    try {
      const topRated = await getTopRatedProduct();
      const lowestRated = await getLowestRatedProduct();
      const mostReviewed = await getMostReviewedProduct();
      const productsByRatingRes = await getProductsByRating('DESC', 1, 10);
      
      if (topRated.error) throw new Error(topRated.error);
      if (lowestRated.error) throw new Error(lowestRated.error);
      if (mostReviewed.error) throw new Error(mostReviewed.error);
      if (productsByRatingRes.error) throw new Error(productsByRatingRes.error);

      setTopRatedProduct(topRated);
      setLowestRatedProduct(lowestRated);
      setMostReviewedProduct(mostReviewed);
      setProductsByRating(productsByRatingRes.products || []);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải dữ liệu thống kê.",
        icon: "error",
      });
    }
  }, []);

  // Lấy thống kê chi tiết của sản phẩm
  const fetchProductStatistics = async (productId) => {
    try {
      const res = await getProductReviewStatistics(productId);
      if (res.error) throw new Error(res.error);
      setProductStatistics(res);
    } catch (error) {
      console.error("Error fetching product statistics:", error);
      setProductStatistics(null);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải thống kê sản phẩm.",
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
          text: "Đã xảy ra lỗi khi xóa đánh giá.",
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
        text: "Đã xảy ra lỗi khi cập nhật trạng thái đánh giá.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (review) => {
    setCurrentReview(review);
    setLoading(true);
    try {
      const res = await getReviewsByProductId(review.productId);
      if (res.error) {
        throw new Error(res.error);
      }
      const selectedReview = res.reviews.find((r) => r.id === review.id);
      setCurrentReview(selectedReview);
      setCurrentReviewImages(selectedReview.images || []);
      fetchProductStatistics(review.productId); // Lấy thống kê của sản phẩm
      setDetailModalVisible(true);
    } catch (error) {
      console.error("Error fetching review details:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải chi tiết đánh giá.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
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
        key: "productName",
        header: "Tên sản phẩm",
        options: ["Tất cả", ...new Set(data.map((item) => item.productName))],
      },
      {
        key: "createdAt",
        header: "Ngày tạo",
        options: [
          "Tất cả",
          ...new Set(data.map((item) => new Date(item.createdAt).toLocaleDateString())),
        ],
      },
    ]);
  }, [data]);

  const reviewColumns = [
    {
      title: "Sản phẩm",
      key: "productName",
      render: (record) => record.productName || "N/A",
    },
    {
      title: "Rating",
      key: "rating",
      render: (record) => `${record.rating}/5`,
    },
    {
      title: "Bình luận",
      key: "comment",
      render: (record) => record.comment || "N/A",
    },
    {
      title: "Ngày tạo",
      key: "createdAt",
      render: (record) =>
        record.createdAt
          ? new Date(record.createdAt).toLocaleDateString()
          : "N/A",
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
    },
  ];

  const productsByRatingColumns = [
    {
      title: "Sản phẩm",
      key: "productName",
      render: (record) => record.productName || "N/A",
    },
    {
      title: "Đánh giá trung bình",
      key: "averageRating",
      render: (record) => record.averageRating?.toFixed(2) || "N/A",
    },
    {
      title: "Số lượng đánh giá",
      key: "reviewCount",
      render: (record) => record.reviewCount || 0,
    },
  ];

  return (
    <div className="wrapper">
      <header className="admin-header">
        <div className="container">
          <h2>QUẢN LÝ ĐÁNH GIÁ</h2>
        </div>
      </header>
      <main className="main">
        <div className="container">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Danh sách đánh giá" key="1">
              <div className="card">
                <div className="card-header">
                  <div className="card-tools">
                    <Filter
                      filters={filters}
                      data={data}
                      validData={validData}
                      setValidData={setValidData}
                      standardSort={standardSort}
                      searchFields={[
                        { key: "productName", placeholder: "Tìm kiếm theo tên sản phẩm" },
                        { key: "comment", placeholder: "Tìm kiếm theo bình luận" },
                      ]}
                    />
                    <Select
                      style={{ width: 200, marginLeft: 16 }}
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
                      style={{ width: 200, marginLeft: 16 }}
                      placeholder="Lọc theo sản phẩm"
                      allowClear
                      onChange={(value) => {
                        setProductIdFilter(value);
                        setCurrentPage(1);
                      }}
                    >
                      {[...new Set(data.map((item) => item.productId))].map((productId) => (
                        <Option key={productId} value={productId}>
                          {data.find((item) => item.productId === productId)?.productName || productId}
                        </Option>
                      ))}
                    </Select>
                    <InputNumber
                      style={{ width: 200, marginLeft: 16 }}
                      placeholder="Lọc theo rating (tối thiểu)"
                      min={1}
                      max={5}
                      onChange={(value) => {
                        setRatingFilter(value);
                        setCurrentPage(1);
                      }}
                    />
                    <RangePicker
                      style={{ marginLeft: 16 }}
                      onChange={(dates) => {
                        setDateRangeFilter(dates || []);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  <div className="card-btns">
                    <Button
                      danger
                      onClick={handleDeleteReview}
                      disabled={!checkedRow.length}
                      style={{ marginLeft: 8 }}
                    >
                      Xóa ({checkedRow.length})
                    </Button>
                  </div>
                </div>
                <div className="card-body">
                  <AntTable
                    dataSource={validData}
                    columns={reviewColumns}
                    rowKey={(record) => record.id}
                    pagination={false}
                    rowSelection={{
                      selectedRowKeys: checkedRow,
                      onChange: (selectedRowKeys) => setCheckedRow(selectedRowKeys),
                    }}
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
                <Card title="Sản phẩm được đánh giá cao nhất">
                  {topRatedProduct ? (
                    <div>
                      <p><strong>Tên sản phẩm:</strong> {topRatedProduct.productName}</p>
                      <p><strong>Đánh giá trung bình:</strong> {topRatedProduct.averageRating?.toFixed(2)}/5</p>
                      <p><strong>Số lượng đánh giá:</strong> {topRatedProduct.reviewCount}</p>
                    </div>
                  ) : (
                    <p>Không có dữ liệu</p>
                  )}
                </Card>
                <Card title="Sản phẩm được đánh giá thấp nhất">
                  {lowestRatedProduct ? (
                    <div>
                      <p><strong>Tên sản phẩm:</strong> {lowestRatedProduct.productName}</p>
                      <p><strong>Đánh giá trung bình:</strong> {lowestRatedProduct.averageRating?.toFixed(2)}/5</p>
                      <p><strong>Số lượng đánh giá:</strong> {lowestRatedProduct.reviewCount}</p>
                    </div>
                  ) : (
                    <p>Không có dữ liệu</p>
                  )}
                </Card>
                <Card title="Sản phẩm có nhiều đánh giá nhất">
                  {mostReviewedProduct ? (
                    <div>
                      <p><strong>Tên sản phẩm:</strong> {mostReviewedProduct.productName}</p>
                      <p><strong>Đánh giá trung bình:</strong> {mostReviewedProduct.averageRating?.toFixed(2)}/5</p>
                      <p><strong>Số lượng đánh giá:</strong> {mostReviewedProduct.reviewCount}</p>
                    </div>
                  ) : (
                    <p>Không có dữ liệu</p>
                  )}
                </Card>
                <Card title="Danh sách sản phẩm theo thứ tự đánh giá">
                  <AntTable
                    dataSource={productsByRating}
                    columns={productsByRatingColumns}
                    rowKey={(record) => record.productId}
                    pagination={false}
                  />
                </Card>
              </div>
            </TabPane>
          </Tabs>

          <Modal
            title="Chi tiết đánh giá"
            visible={detailModalVisible}
            onCancel={() => {
              setDetailModalVisible(false);
              setCurrentReview(null);
              setCurrentReviewImages([]);
              setProductStatistics(null);
            }}
            footer={null}
            className={styles.reviewDetailModal}
            width={800}
          >
            {currentReview ? (
              <div className={styles.reviewDetailContent}>
                <div className={styles.reviewInfo}>
                  <h3>Tên sản phẩm: {currentReview.productName}</h3>
                  <p><strong>Rating:</strong> {currentReview.rating}/5</p>
                  <p><strong>Bình luận:</strong> {currentReview.comment}</p>
                  <p><strong>Ngày tạo:</strong> {new Date(currentReview.createdAt).toLocaleString()}</p>
                  <p><strong>Trạng thái:</strong> {currentReview.isHidden ? "Ẩn" : "Hiển thị"}</p>
                </div>
                {productStatistics && (
                  <div className={styles.statisticsSection}>
                    <h3>Thống kê đánh giá sản phẩm</h3>
                    <Statistic title="Đánh giá trung bình" value={productStatistics.averageRating?.toFixed(2)} suffix="/5" />
                    <Statistic title="Số lượng đánh giá" value={productStatistics.reviewCount} />
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
                          style={{ objectFit: "cover", margin: "10px" }}
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