import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Select,
  Switch,
  Table as AntTable,
  Tooltip,
  Tag,
} from "antd";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import Filter from "../../../components/admin/filter/Filter";
import config from "../../../config";
import { EditOutlined } from "@ant-design/icons";
import {
  addDiscount,
  deleteDiscount,
  getDiscountList,
  updateDiscount,
} from "../../../services/api/discountService";
import styles from "./index.module.scss";
import dayjs from "../../../components/common/layout/dayjs-setup";

const { Option } = Select;

const AdminDiscountList = () => {
  const [data, setData] = useState([]);
  const [validData, setValidData] = useState([]);
  const [filters, setFilters] = useState([]);
  const [checkedRow, setCheckedRow] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [detailForm] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = config.LIMIT || 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDiscountList();
      const items = res || [];
      setData(items);
      setValidData(items);
      setTotal(res?.total || items.length || 0);
    } catch (error) {
      console.error("Error fetching discounts:", error);
      setData([]);
      setValidData([]);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải danh sách mã giảm giá.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddDiscount = async (values) => {
    const payload = {
      name: values.name,
      condition: values.condition,
      discountValue: Number(values.discountValue),
      discountType: values.discountType,
      quantity: values.quantity,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
      isActive: values.isActive,
    };

    setLoading(true);
    try {
      const res = await addDiscount(payload);
      if (res) {
        setModalVisible(false);
        form.resetFields();
        fetchData();
        Swal.fire({
          title: "Thêm mã giảm giá thành công!",
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

  const handleUpdateDiscount = async (values, formType = "edit") => {
    const payload = {
      name: values.name,
      condition: values.condition,
      discountValue: Number(values.discountValue),
      discountType: values.discountType,
      quantity: values.quantity,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
      isActive: values.isActive,
    };

    setLoading(true);
    try {
      const res = await updateDiscount(currentDiscount.id, payload);
      if (res) {
        if (formType === "edit") {
          setEditModalVisible(false);
          editForm.resetFields();
        } else {
          setDetailModalVisible(false);
          detailForm.resetFields();
        }
        setCurrentDiscount(null);
        fetchData();
        Swal.fire({
          title: "Cập nhật mã giảm giá thành công!",
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

  const handleDeleteData = async () => {
    if (!Array.isArray(checkedRow) || checkedRow.length === 0) {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng chọn ít nhất một mã giảm giá để xóa.",
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
        await Promise.all(checkedRow.map((id) => deleteDiscount(id)));
        Swal.fire({
          title: "Đã xóa!",
          text: "Mã giảm giá đã được xóa thành công.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchData();
        setCheckedRow([]);
      } catch (error) {
        Swal.fire({
          title: "Lỗi!",
          text: "Đã xảy ra lỗi khi xóa mã giảm giá.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (discount) => {
    setCurrentDiscount(discount);
    editForm.setFieldsValue({
      name: discount.name,
      condition: discount.condition,
      discountValue: Number(discount.discountValue),
      discountType: discount.discountType,
      quantity: discount.quantity,
      startDate: dayjs(discount.startDate),
      endDate: dayjs(discount.endDate),
      isActive: discount.isActive,
    });
    setEditModalVisible(true);
  };

  const handleViewDetail = (discount) => {
    setCurrentDiscount(discount);
    detailForm.setFieldsValue({
      name: discount.name,
      condition: discount.condition,
      discountValue: Number(discount.discountValue),
      discountType: discount.discountType,
      quantity: discount.quantity,
      startDate: dayjs(discount.startDate),
      endDate: dayjs(discount.endDate),
      isActive: discount.isActive,
    });
    setDetailModalVisible(true);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setFilters([
      {
        key: "condition",
        header: "Điều kiện",
        options: ["Tất cả", "SHIPPING", "TOTAL"],
      },
      {
        key: "discountType",
        header: "Loại giảm giá",
        options: ["Tất cả", "PERCENTAGE", "FIXED"],
      },
      {
        key: "isActive",
        header: "Trạng thái",
        options: ["Tất cả", "Kích hoạt", "Không kích hoạt"],
      },
    ]);
  }, []);

  const standardSort = [
    { name: "Tên mã giảm giá", type: "name" },
    { name: "Số tiền giảm", type: "discountValue" },
    { name: "Ngày tạo", type: "createdAt" },
    { name: "Ngày kết thúc", type: "endDate" },
    { name: "Số lượng", type: "quantity" },
    { name: "Trạng thái", type: "isActive" },
  ];

  const discountTypeOptions = [
    { label: "Phần trăm", value: "PERCENTAGE" },
    { label: "Số tiền cố định", value: "FIXED" },
  ];

  const conditionOptions = [
    { label: "Vận chuyển", value: "SHIPPING" },
    { label: "Tổng đơn hàng", value: "TOTAL" },
  ];

  const columns = [
    {
      title: "Tên mã giảm giá",
      dataIndex: "name",
      key: "name",
      render: (text) => text || "N/A",
    },
    {
      title: "Loại giảm giá",
      dataIndex: "discountType",
      key: "discountType",
      render: (discountType) => {
        const option = discountTypeOptions.find(
          (opt) => opt.value === discountType,
        );
        return option ? option.label : "N/A";
      },
    },
    {
      title: "Điều kiện",
      dataIndex: "condition",
      key: "condition",
      render: (condition) => {
        const option = conditionOptions.find((opt) => opt.value === condition);
        return option ? option.label : "N/A";
      },
    },
    {
      title: "Số tiền giảm",
      dataIndex: "discountValue",
      key: "discountValue",
      render: (discountValue, record) => {
        if (record.discountType === "PERCENTAGE") {
          return `${discountValue}%`;
        }
        return `${parseFloat(discountValue).toLocaleString()} VNĐ`;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "success" : "error"}>
          {isActive ? "Kích hoạt" : "Không kích hoạt"}
        </Tag>
      ),
      align: "center",
    },
    {
      title: "Chi tiết",
      key: "details",
      render: (row) => (
        <Tooltip title="Xem chi tiết">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleViewDetail(row)}
            style={{ border: "none", color: "#1890ff" }}
          />
        </Tooltip>
      ),
    },
  ];

  const checkDiscountNameUnique = (name, currentDiscountId = null) => {
    const allDiscountNames = data.map((item) => item.name.toLowerCase());

    if (currentDiscountId) {
      const currentDiscount = data.find(
        (item) => item.id === currentDiscountId,
      );
      if (
        currentDiscount &&
        currentDiscount.name.toLowerCase() === name.toLowerCase()
      ) {
        return true;
      }
    }

    return !allDiscountNames.includes(name.toLowerCase());
  };

  return (
    <div className="wrapper">
      <header className="admin-header">
        <div
          className="container"
          style={{
            background:
              "linear-gradient(90deg, #f3e0bf, rgba(253, 252, 243, 0.7))",
            height: "70px",
            display: "flex",
            paddingLeft: "280px",
            alignItems: "center",
          }}
        >
          <h2>QUẢN LÝ MÃ GIẢM GIÁ</h2>
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
                  setValidData={setValidData}
                  standardSort={standardSort}
                  searchFields={[
                    {
                      key: "name",
                      placeholder: "Tìm theo tên mã giảm giá",
                    },
                  ]}
                />
              </div>
              <div className="card-btns">
                <Button type="primary" onClick={() => setModalVisible(true)}>
                  Thêm
                </Button>
                <Button
                  danger
                  onClick={handleDeleteData}
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
                columns={columns}
                rowKey="id"
                pagination={false}
                rowSelection={{
                  type: "checkbox",
                  onChange: (selectedRowKeys) => setCheckedRow(selectedRowKeys),
                }}
                rowClassName={(record) =>
                  !record.isActive ? styles.inactiveRow : ""
                }
              />
            </div>
            {total > limit && (
              <div className={styles.pagination}>
                <Pagination
                  current={currentPage}
                  pageSize={limit}
                  total={total}
                  onChange={(page) => setCurrentPage(page)}
                  showQuickJumper
                />
              </div>
            )}
          </div>

          {/* Add Discount Modal */}
          <Modal
            title="Thêm mã giảm giá"
            visible={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              form.resetFields();
            }}
            footer={null}
            className={styles.addDiscountModal}
            width={600}
            centered
          >
            <Form form={form} layout="vertical" onFinish={handleAddDiscount}>
              <Form.Item
                label="Tên mã giảm giá"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên mã giảm giá!" },
                  {
                    validator: async (_, value) => {
                      if (!value) return Promise.resolve();
                      if (checkDiscountNameUnique(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Tên mã giảm giá đã tồn tại!"),
                      );
                    },
                  },
                ]}
              >
                <Input placeholder="Nhập tên mã giảm giá" />
              </Form.Item>
              <Form.Item
                label="Điều kiện"
                name="condition"
                rules={[
                  { required: true, message: "Vui lòng chọn điều kiện!" },
                ]}
              >
                <Select placeholder="Chọn điều kiện">
                  {conditionOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Số tiền giảm"
                name="discountValue"
                rules={[
                  { required: true, message: "Vui lòng nhập số tiền giảm!" },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Nhập số tiền giảm"
                />
              </Form.Item>
              <Form.Item
                label="Loại giảm giá"
                name="discountType"
                rules={[
                  { required: true, message: "Vui lòng chọn loại giảm giá!" },
                ]}
              >
                <Select placeholder="Chọn loại giảm giá">
                  {discountTypeOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Nhập số lượng"
                />
              </Form.Item>
              <Form.Item
                label="Ngày bắt đầu"
                name="startDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu!" },
                ]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label="Ngày kết thúc"
                name="endDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày kết thúc!" },
                ]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label="Trạng thái"
                name="isActive"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
              <Form.Item className={styles.formActions}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ marginRight: "12px" }}
                >
                  Thêm mã giảm giá
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

          {/* Edit Discount Modal */}
          <Modal
            title="Chỉnh sửa mã giảm giá"
            visible={editModalVisible}
            onCancel={() => {
              setEditModalVisible(false);
              setCurrentDiscount(null);
              editForm.resetFields();
            }}
            footer={null}
            className={styles.addDiscountModal}
            width={600}
            centered
          >
            <Form
              form={editForm}
              layout="vertical"
              onFinish={handleUpdateDiscount}
            >
              <Form.Item
                label="Tên mã giảm giá"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên mã giảm giá!" },
                  {
                    validator: async (_, value) => {
                      if (!value) return Promise.resolve();
                      if (checkDiscountNameUnique(value, currentDiscount?.id)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Tên mã giảm giá đã tồn tại!"),
                      );
                    },
                  },
                ]}
              >
                <Input placeholder="Nhập tên mã giảm giá" />
              </Form.Item>
              <Form.Item
                label="Điều kiện"
                name="condition"
                rules={[
                  { required: true, message: "Vui lòng chọn điều kiện!" },
                ]}
              >
                <Select placeholder="Chọn điều kiện">
                  {conditionOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Số tiền giảm"
                name="discountValue"
                rules={[
                  { required: true, message: "Vui lòng nhập số tiền giảm!" },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Nhập số tiền giảm"
                />
              </Form.Item>
              <Form.Item
                label="Loại giảm giá"
                name="discountType"
                rules={[
                  { required: true, message: "Vui lòng chọn loại giảm giá!" },
                ]}
              >
                <Select placeholder="Chọn loại giảm giá">
                  {discountTypeOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Nhập số lượng"
                />
              </Form.Item>
              <Form.Item
                label="Ngày bắt đầu"
                name="startDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu!" },
                ]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label="Ngày kết thúc"
                name="endDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày kết thúc!" },
                ]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label="Trạng thái"
                name="isActive"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item className={styles.formActions}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Cập nhật mã giảm giá
                </Button>
                <Button
                  className={styles.cancelButton}
                  onClick={() => {
                    setEditModalVisible(false);
                    setCurrentDiscount(null);
                    editForm.resetFields();
                  }}
                >
                  Hủy
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          {/* Detail Discount Modal */}
          <Modal
            title="Chỉnh sửa mã giảm giá"
            visible={detailModalVisible}
            onCancel={() => {
              setDetailModalVisible(false);
              setCurrentDiscount(null);
              detailForm.resetFields();
            }}
            footer={null}
            className={styles.addDiscountModal}
            width={600}
            centered
          >
            <Form
              form={detailForm}
              layout="vertical"
              onFinish={(values) => handleUpdateDiscount(values, "detail")}
            >
              <Form.Item
                label="Tên mã giảm giá"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên mã giảm giá!" },
                  {
                    validator: async (_, value) => {
                      if (!value) return Promise.resolve();
                      if (checkDiscountNameUnique(value, currentDiscount?.id)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Tên mã giảm giá đã tồn tại!"),
                      );
                    },
                  },
                ]}
              >
                <Input placeholder="Nhập tên mã giảm giá" />
              </Form.Item>
              <Form.Item
                label="Điều kiện"
                name="condition"
                rules={[
                  { required: true, message: "Vui lòng chọn điều kiện!" },
                ]}
              >
                <Select placeholder="Chọn điều kiện">
                  {conditionOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Số tiền giảm"
                name="discountValue"
                rules={[
                  { required: true, message: "Vui lòng nhập số tiền giảm!" },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Nhập số tiền giảm"
                />
              </Form.Item>
              <Form.Item
                label="Loại giảm giá"
                name="discountType"
                rules={[
                  { required: true, message: "Vui lòng chọn loại giảm giá!" },
                ]}
              >
                <Select placeholder="Chọn loại giảm giá">
                  {discountTypeOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Nhập số lượng"
                />
              </Form.Item>
              <Form.Item
                label="Ngày bắt đầu"
                name="startDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu!" },
                ]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label="Ngày kết thúc"
                name="endDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày kết thúc!" },
                ]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label="Trạng thái"
                name="isActive"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item className={styles.formActions}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ marginRight: "12px" }}
                >
                  Cập nhật
                </Button>
                <Button
                  className={styles.cancelButton}
                  onClick={() => {
                    setDetailModalVisible(false);
                    setCurrentDiscount(null);
                    detailForm.resetFields();
                  }}
                >
                  Hủy
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </main>
    </div>
  );
};

export default AdminDiscountList;
