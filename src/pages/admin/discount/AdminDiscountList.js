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
} from "antd";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import Filter from "../../../components/admin/filter/Filter";
import Table from "../../../components/admin/table/Table";
import config from "../../../config";

import {
  addDiscount,
  deleteDiscount,
  getDiscountList,
  updateDiscount,
} from "../../../services/api/discountService";
import styles from "./index.module.scss";
const { Option } = Select;
const AdminDiscountList = () => {
  const [data, setData] = useState([]);
  const [validData, setValidData] = useState([]);
  const [filters, setFilters] = useState([]);
  const [checkedRow, setCheckedRow] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = config.LIMIT || 10;

  const standardSort = ["name", "originalPrice"];

  const fetchData = useCallback(async () => {
    try {
      const res = await getDiscountList();
      console.log("res", res);

      const items = res || [];
      setData(items);
      setValidData(items);
      setTotal(res?.total || items.length || 0);
    } catch (error) {
      console.error("Error fetching discounts:", error);
      setData([]);
      setValidData([]);
    }
  }, [currentPage, limit]);

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
    }
  };

  const handleUpdateDiscount = async (values) => {
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

    try {
      const res = await updateDiscount(currentProduct.id, payload);
      if (res) {
        setEditModalVisible(false);
        editForm.resetFields();
        setCurrentProduct(null);
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
      }
    }
  };

  const handleEdit = (discount) => {
    setCurrentProduct(discount);
    editForm.setFieldsValue({
      name: discount.name,
      condition: discount.condition,
      discountValue: Number(discount.discountValue),
      discountType: discount.discountType,
      quantity: discount.quantity,
      startDate: moment(discount.startDate),
      endDate: moment(discount.endDate),
      isActive: discount.isActive,
    });
    setEditModalVisible(true);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const discountTypeOptions = [
    { label: "Phần trăm", value: "PERCENTAGE" },
    { label: "Số tiền cố định", value: "FLAT" },
    { label: "Giảm giá vận chuyển", value: "SHIPPING_DISCOUNT" },
  ];

  const conditionOptions = [
    { label: "Vận chuyển", value: "SHIPPING" },
    { label: "Tổng đơn hàng", value: "TOTAL" },
  ];

  return (
    <div className="wrapper">
      <header className="admin-header">
        <div className="container">
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
                      key: "condition",
                      placeholder: "Tìm theo điều kiện",
                    },
                  ]}
                />
              </div>
              <div className="card-btns">
                <Button
                  className="admin-btn"
                  onClick={() => setModalVisible(true)}
                >
                  Thêm
                </Button>
                <Button
                  className="admin-btn del-btn"
                  onClick={handleDeleteData}
                >
                  Xóa
                </Button>
              </div>
            </div>
            <div className="card-body">
              <Table
                rows={validData}
                columns={[
                  {
                    key: "condition",
                    header: "Điều kiện",
                    render: (row) => row.condition,
                  },
                  {
                    key: "discountValue",
                    header: "Số tiền giảm",
                    render: (row) => row.discountValue,
                  },
                  {
                    key: "createdAt",
                    header: "Ngày tạo",
                    render: (row) => row.createdAt,
                  },
                  {
                    key: "endDate",
                    header: "Ngày kết thúc",
                    render: (row) => row.endDate,
                  },
                  {
                    key: "quantity",
                    header: "Số lượng",
                    render: (row) => row.quantity,
                  },
                  {
                    key: "isActive",
                    header: "Trạng thái",
                    render: (row) => row.isActive,
                  },
                ]}
                setChecked={setCheckedRow}
                onEdit={handleEdit}
              />
            </div>
            <div className={styles.pagination}>
              <Pagination
                current={currentPage}
                pageSize={limit}
                total={total}
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
          </div>

          {/* Add Discount Modal */}
          <Modal
            title="Thêm mã giảm giá"
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
          >
            <Form form={form} layout="vertical" onFinish={handleAddDiscount}>
              <Form.Item
                label="Tên mã giảm giá"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên mã giảm giá!" },
                ]}
              >
                <Input />
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
                <InputNumber min={0} style={{ width: "100%" }} />
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
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Ngày bắt đầu"
                name="startDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu!" },
                ]}
              >
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Ngày kết thúc"
                name="endDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày kết thúc!" },
                ]}
              >
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Trạng thái"
                name="isActive"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Thêm mã giảm giá
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
              setCurrentProduct(null);
              editForm.resetFields();
            }}
            footer={null}
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
                ]}
              >
                <Input />
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
                <InputNumber min={0} style={{ width: "100%" }} />
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
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Ngày bắt đầu"
                name="startDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu!" },
                ]}
              >
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Ngày kết thúc"
                name="endDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày kết thúc!" },
                ]}
              >
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Trạng thái"
                name="isActive"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Cập nhật mã giảm giá
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
