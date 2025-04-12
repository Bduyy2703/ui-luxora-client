import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Upload,
  Pagination,
  Image,
  Tooltip,
  Table as AntTable,
  Carousel,
} from "antd";
import Swal from "sweetalert2";
import Filter from "../../../components/admin/filter/Filter";
import config from "../../../config";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoOutlined,
} from "@ant-design/icons";
import styles from "./index.module.scss";
import {
  getAllBlogs,
  getBlogById,
  addBlog,
  updateBlog,
  deleteBlog,
} from "../../../services/api/blogService";

// Các component DetailForm1, DetailForm2, DetailForm3 giữ nguyên
const DetailForm1 = ({ currentBlog, currentBlogImages, styles }) => {
  const splitContentIntoParagraphs = (content) => {
    if (!content) return [];
    return content
      .split(/\. |\n/)
      .filter((paragraph) => paragraph.trim() !== "");
  };

  const groupParagraphs = (paragraphs, groupSize = 5) => {
    const grouped = [];
    for (let i = 0; i < paragraphs.length; i += groupSize) {
      grouped.push(paragraphs.slice(i, i + groupSize));
    }
    return grouped;
  };

  return (
    <div className={styles.blogDetailContainer}>
      <div
        className={styles.blogDetailHeader}
        style={{
          backgroundImage: currentBlog.thumbnail
            ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${currentBlog.thumbnail})`
            : "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))",
        }}
      >
        <h2>{currentBlog.title}</h2>
      </div>

      <div className={styles.blogDetailContent}>
        <div className={styles.blogExcerpt}>
          <h3>Nội dung chính</h3>
          <p>{currentBlog.excerpt}</p>
        </div>

        <div className={styles.blogContent}>
          {groupParagraphs(
            splitContentIntoParagraphs(currentBlog.content),
            5,
          ).map((group, groupIndex) => (
            <div key={groupIndex} className={styles.contentSection}>
              <div className={styles.textWrapper}>
                {group.map((paragraph, paraIndex) => (
                  <p key={paraIndex}>{paragraph}.</p>
                ))}
              </div>
              {currentBlogImages[groupIndex] && (
                <div className={styles.imageWrapper}>
                  <Image
                    src={currentBlogImages[groupIndex].fileUrl}
                    alt={`Blog Image ${groupIndex + 1}`}
                    className={styles.contentImage}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {currentBlogImages.length > 0 && (
          <div className={styles.imageCarousel}>
            <h3>Hình ảnh</h3>
            <Carousel
              autoplay
              dots
              effect="fade"
              className={styles.carousel}
              autoplaySpeed={3000}
            >
              {currentBlogImages.map((image) => (
                <div key={image.fileId}>
                  <Image
                    src={image.fileUrl}
                    alt="Blog Image"
                    className={styles.carouselImage}
                  />
                </div>
              ))}
            </Carousel>
          </div>
        )}

        <div className={styles.blogFooter}>
          <p>
            <strong>Ngày tạo:</strong>{" "}
            {new Date(currentBlog.createAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

const DetailForm2 = ({ currentBlog, currentBlogImages, styles }) => {
  const splitContentIntoParagraphs = (content) => {
    if (!content) return [];
    return content
      .split(/\. |\n/)
      .filter((paragraph) => paragraph.trim() !== "");
  };

  const groupParagraphs = (paragraphs, groupSize = 5) => {
    const grouped = [];
    for (let i = 0; i < paragraphs.length; i += groupSize) {
      grouped.push(paragraphs.slice(i, i + groupSize));
    }
    return grouped;
  };

  return (
    <div className={styles.blogDetailContainerForm2}>
      {currentBlogImages.length > 0 && (
        <div className={styles.imageCarousel}>
          <Carousel
            autoplay
            dots
            effect="fade"
            className={styles.carousel}
            autoplaySpeed={3000}
          >
            {currentBlogImages.map((image) => (
              <div key={image.fileId}>
                <Image
                  src={image.fileUrl}
                  alt="Blog Image"
                  className={styles.carouselImage}
                />
              </div>
            ))}
          </Carousel>
        </div>
      )}

      <div
        className={styles.blogDetailHeader}
        style={{
          backgroundImage: currentBlog.thumbnail
            ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${currentBlog.thumbnail})`
            : "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))",
        }}
      >
        <h2>{currentBlog.title}</h2>
      </div>

      <div className={styles.blogDetailContent}>
        <div className={styles.blogExcerpt}>
          <h3>Nội dung chính</h3>
          <p>{currentBlog.excerpt}</p>
        </div>

        <div className={styles.blogContent}>
          {groupParagraphs(
            splitContentIntoParagraphs(currentBlog.content),
            5,
          ).map((group, groupIndex) => (
            <div key={groupIndex} className={styles.contentSection}>
              <div className={styles.textWrapper}>
                {group.map((paragraph, paraIndex) => (
                  <p key={paraIndex}>{paragraph}.</p>
                ))}
              </div>
              {currentBlogImages[groupIndex] && (
                <div className={styles.imageWrapper}>
                  <Image
                    src={currentBlogImages[groupIndex].fileUrl}
                    alt={`Blog Image ${groupIndex + 1}`}
                    className={styles.contentImage}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.blogFooter}>
          <p>
            <strong>Ngày tạo:</strong>{" "}
            {new Date(currentBlog.createAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

const DetailForm3 = ({ currentBlog, currentBlogImages, styles }) => {
  const splitContentIntoParagraphs = (content) => {
    if (!content) return [];
    return content
      .split(/\. |\n/)
      .filter((paragraph) => paragraph.trim() !== "");
  };

  const groupParagraphs = (paragraphs, groupSize = 5) => {
    const grouped = [];
    for (let i = 0; i < paragraphs.length; i += groupSize) {
      grouped.push(paragraphs.slice(i, i + groupSize));
    }
    return grouped;
  };

  return (
    <div className={styles.blogDetailContainerForm3}>
      <div
        className={styles.blogDetailHeader}
        style={{
          backgroundImage: currentBlog.thumbnail
            ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${currentBlog.thumbnail})`
            : "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))",
        }}
      >
        <h2>{currentBlog.title}</h2>
      </div>

      <div className={styles.blogDetailContent}>
        <div className={styles.blogContentGrid}>
          <div className={styles.blogExcerpt}>
            <h3>Nội dung chính</h3>
            <p>{currentBlog.excerpt}</p>
          </div>

          <div className={styles.blogContent}>
            <h3>Nội dung chi tiết</h3>
            {groupParagraphs(
              splitContentIntoParagraphs(currentBlog.content),
              5,
            ).map((group, groupIndex) => (
              <div key={groupIndex} className={styles.contentSection}>
                <div className={styles.textWrapper}>
                  {group.map((paragraph, paraIndex) => (
                    <p key={paraIndex}>{paragraph}.</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {currentBlogImages.length > 0 && (
            <div className={styles.imageGrid}>
              {currentBlogImages.map((image) => (
                <div key={image.fileId} className={styles.imageWrapper}>
                  <Image
                    src={image.fileUrl}
                    alt="Blog Image"
                    className={styles.contentImage}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.blogFooter}>
          <p>
            <strong>Ngày tạo:</strong>{" "}
            {new Date(currentBlog.createAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

const AdminBlogList = () => {
  const [data, setData] = useState([]);
  const [validData, setValidData] = useState([]);
  const [filters, setFilters] = useState([]);
  const [checkedRow, setCheckedRow] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [currentBlogImages, setCurrentBlogImages] = useState([]);
  const [selectedFormType, setSelectedFormType] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = config.LIMIT || 10;

  const standardSort = ["title", "createdAt"];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllBlogs();
      if (res.error) {
        throw new Error(res.error);
      }
      const items = res?.blogs || [];
      setData(items);
      setValidData(items);
      setTotal(items.length || 0);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setData([]);
      setValidData([]);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải danh sách bài viết.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddBlog = async (values) => {
    const { title, excerpt, content, images } = values;

    const files = images
      ?.map((fileObj) => fileObj.originFileObj)
      .filter(Boolean);

    if (!files || files.length === 0) {
      Swal.fire({
        title: "Lỗi!",
        text: "Vui lòng chọn ít nhất một hình ảnh!",
        icon: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("excerpt", excerpt);
    formData.append("content", content);
    files.forEach((file) => formData.append("files", file));

    setLoading(true);
    try {
      const res = await addBlog(formData);
      if (res.blog) {
        setModalVisible(false);
        form.resetFields();
        fetchData();
        Swal.fire({
          title: "Thêm bài viết thành công!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: error.message || "Không thể thêm bài viết!",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBlog = async (values) => {
    const { title, excerpt, content, images } = values;

    const keepFiles = [];
    const newFiles = [];
    if (images && Array.isArray(images)) {
      images.forEach((fileObj) => {
        if (fileObj.status === "done" && fileObj.fileId) {
          keepFiles.push({
            fileId: fileObj.fileId,
            fileName: fileObj.fileName,
            bucketName: fileObj.bucketName || "public",
          });
        } else if (fileObj.originFileObj) {
          newFiles.push(fileObj.originFileObj);
        }
      });
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("excerpt", excerpt);
    formData.append("content", content);
    if (keepFiles.length > 0) {
      formData.append("keepFiles", JSON.stringify(keepFiles));
    }
    newFiles.forEach((file) => formData.append("files", file));

    setLoading(true);
    try {
      const res = await updateBlog(currentBlog.id, formData);
      if (res.blog) {
        setEditModalVisible(false);
        editForm.resetFields();
        setCurrentBlog(null);
        fetchData();
        Swal.fire({
          title: "Cập nhật bài viết thành công!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: error.message,
        icon: "error",
        showConfirmButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async () => {
    if (!Array.isArray(checkedRow) || checkedRow.length === 0) {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng chọn ít nhất một bài viết để xóa.",
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
        await Promise.all(checkedRow.map((id) => deleteBlog(id)));
        Swal.fire({
          title: "Đã xóa!",
          text: "Bài viết đã được xóa thành công.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchData();
        setCheckedRow([]);
      } catch (error) {
        Swal.fire({
          title: "Lỗi!",
          text: "Đã xảy ra lỗi khi xóa bài viết.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = async (blog) => {
    setCurrentBlog(blog);
    setLoading(true);
    try {
      const blogDetails = await getBlogById(blog.id);
      if (blogDetails.error) {
        throw new Error(blogDetails.error);
      }
      const images =
        blogDetails.images?.map((img, index) => ({
          uid: img.fileId || index,
          name: img.fileName || `image-${index}`,
          status: "done",
          url: img.fileUrl,
          fileId: img.fileId,
          fileName: img.fileName,
          bucketName: img.bucketName || "public",
        })) || [];

      editForm.setFieldsValue({
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        images,
      });
    } catch (error) {
      console.error("Error fetching blog details:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải thông tin bài viết.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
    setEditModalVisible(true);
  };

  const getRandomFormType = () => {
    const formTypes = ["form1", "form2", "form3"];
    const randomIndex = Math.floor(Math.random() * formTypes.length);
    return formTypes[randomIndex];
  };

  const handleViewDetails = async (blog) => {
    setCurrentBlog(blog);
    setLoading(true);
    try {
      const res = await getBlogById(blog.id);
      if (res.error) {
        throw new Error(res.error);
      }
      setCurrentBlog(res.blog);
      setCurrentBlogImages(res.images || []);
      setSelectedFormType(getRandomFormType());
      setDetailModalVisible(true);
    } catch (error) {
      console.error("Error fetching blog details:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải chi tiết bài viết.",
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
    setFilters([
      {
        key: "title",
        header: "Tiêu đề",
        options: ["Tất cả", ...new Set(data.map((item) => item.title))],
      },
      {
        key: "createdAt",
        header: "Ngày tạo",
        options: [
          "Tất cả",
          ...new Set(
            data.map((item) => new Date(item.createAt).toLocaleDateString()),
          ),
        ],
      },
    ]);
  }, [data]);

  const blogColumns = [
    {
      title: "Thumbnail",
      key: "thumbnail",
      render: (record) =>
        record.thumbnail ? (
          <Image
            src={record.thumbnail}
            alt="Thumbnail"
            width={50}
            height={50}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span>Không có ảnh</span>
        ),
    },
    {
      title: "Tiêu đề",
      key: "title",
      render: (record) => {
        return <div>{record.title || "N/A"}</div>;
      },
    },
    {
      title: "Đoạn trích",
      key: "excerpt",
      render: (record) => record.excerpt || "N/A",
    },
    {
      title: "Ngày tạo",
      key: "createdAt",
      render: (record) =>
        record.createAt
          ? new Date(record.createAt).toLocaleDateString()
          : "N/A",
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
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ border: "none", color: "#1890ff" }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => {
                setCheckedRow([record.id]);
                handleDeleteBlog();
              }}
              style={{ border: "none", color: "#ff4d4f" }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="wrapper">
      <header className="admin-header">
        <div className="container">
          <h2>QUẢN LÝ BÀI VIẾT</h2>
        </div>
      </header>
      <main className="main">
        <div className="container">
          <div className="card">
            <div className="card-header">
              <div className="card-tools">
                <Filter
                  filters={filters}
                  data={data}
                  validData={validData}
                  className={styles.blogFilter}
                  setValidData={setValidData}
                  standardSort={[
                    { name: "Tiêu đề", type: "title" },
                    { name: "Đoạn trích", type: "excerpt" },
                    { name: "Ngày tạo", type: "createAt" },
                    { name: "Nội dung", type: "content" },
                  ]}
                  searchFields={[
                    { key: "title", placeholder: "Tìm kiếm theo tiêu đề" },
                    { key: "excerpt", placeholder: "Tìm kiếm theo đoạn trích" },
                  ]}
                />
              </div>
              <div className="card-btns">
                <Button type="primary" onClick={() => setModalVisible(true)}>
                  Thêm
                </Button>
                <Button
                  danger
                  onClick={handleDeleteBlog}
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
                columns={blogColumns}
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

          {/* Modal Thêm bài viết */}
          <Modal
            title="Thêm bài viết"
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
            className={styles.blogModal}
            width={600}
          >
            <Form form={form} layout="vertical" onFinish={handleAddBlog}>
              <Form.Item
                label="Hình ảnh"
                name="images"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) return e;
                  return e?.fileList || [];
                }}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất một hình ảnh!",
                  },
                ]}
              >
                <Upload
                  listType="picture"
                  beforeUpload={() => false}
                  multiple
                  accept="image/*"
                >
                  <Button icon={<PlusOutlined />}>Chọn ảnh</Button>
                </Upload>
              </Form.Item>
              <Form.Item
                label="Tiêu đề"
                name="title"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Đoạn trích"
                name="excerpt"
                rules={[
                  { required: true, message: "Vui lòng nhập đoạn trích!" },
                ]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
              <Form.Item
                label="Nội dung"
                name="content"
                rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
              >
                <Input.TextArea rows={6} />
              </Form.Item>
              <Form.Item className={styles.formActions}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ marginRight: 8 }}
                >
                  Thêm bài viết
                </Button>
                <Button
                  className={styles.cancelButton}
                  onClick={() => setModalVisible(false)}
                >
                  Hủy
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title={<div className={styles.modalTitle}>Chỉnh sửa bài viết</div>}
            visible={editModalVisible}
            onCancel={() => {
              setEditModalVisible(false);
              setCurrentBlog(null);
              editForm.resetFields();
            }}
            footer={null}
            className={styles.blogModal}
            width={600}
            centered
            bodyStyle={{
              maxHeight: "70vh",
              overflowY: "auto",
              padding: "24px 24px -1px",
            }}
          >
            <Form form={editForm} layout="vertical" onFinish={handleUpdateBlog}>
              <Form.Item
                label="Hình ảnh"
                name="images"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              >
                <Upload listType="picture" beforeUpload={() => false} multiple>
                  <Button icon={<PlusOutlined />}>Chọn ảnh</Button>
                </Upload>
              </Form.Item>
              <Form.Item
                label="Tiêu đề"
                name="title"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Đoạn trích"
                name="excerpt"
                rules={[
                  { required: true, message: "Vui lòng nhập đoạn trích!" },
                ]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
              <Form.Item
                label="Nội dung"
                name="content"
                rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
              >
                <Input.TextArea rows={6} />
              </Form.Item>
              <Form.Item
                className={styles.formActions}
                style={{
                  background: "#fff",
                  margin: 0,
                  zIndex: 10,
                }}
              >
                <Button type="primary" htmlType="submit" loading={loading}>
                  Cập nhật
                </Button>
                <Button
                  className={styles.cancelButton}
                  onClick={() => {
                    setEditModalVisible(false);
                    setCurrentBlog(null);
                    editForm.resetFields();
                  }}
                  style={{ marginLeft: 8 }}
                >
                  Hủy
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title={null}
            visible={detailModalVisible}
            onCancel={() => {
              setDetailModalVisible(false);
              setCurrentBlog(null);
              setCurrentBlogImages([]);
              setSelectedFormType(null);
            }}
            footer={null}
            className={styles.blogDetailModal}
            width={1200}
          >
            {currentBlog && selectedFormType ? (
              <>
                {selectedFormType === "form1" && (
                  <DetailForm1
                    currentBlog={currentBlog}
                    currentBlogImages={currentBlogImages}
                    styles={styles}
                  />
                )}
                {selectedFormType === "form2" && (
                  <DetailForm2
                    currentBlog={currentBlog}
                    currentBlogImages={currentBlogImages}
                    styles={styles}
                  />
                )}
                {selectedFormType === "form3" && (
                  <DetailForm3
                    currentBlog={currentBlog}
                    currentBlogImages={currentBlogImages}
                    styles={styles}
                  />
                )}
              </>
            ) : (
              <p>Không có dữ liệu bài viết</p>
            )}
          </Modal>
        </div>
      </main>
    </div>
  );
};

export default AdminBlogList;
