import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronRight,
    faChevronLeft,
    faArrowUpWideShort,
    faArrowUpShortWide,
} from "@fortawesome/free-solid-svg-icons";
import config from "../../../config";
import Filter from "../../../components/admin/filter/Filter";
import Table from "../../../components/admin/table/Table";
import Pagination from "../../../components/admin/pagination/Pagination";

const AdminUserDetail = () => {
    const API_URL = `${config.API_URL}users/profiles`;
    const { email } = useParams();
    const [user, setUser] = useState([]);
    const [data, setData] = useState([]);
    const [validData, setValidData] = useState([]);
    const [pageData, setPageData] = useState([]);
    const [filters, setFilters] = useState([]);
    const [initialValues, setInitialValues] = useState([]);
    const [phoneNumber, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [phoneError, setPhoneError] = useState("");

    const fetchUser = useCallback(async () => {

        if (password.length < 6) {
            setPasswordError("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
          } else {
            setPasswordError("");
          }
          if (!/^(0\d{9})$/.test(phoneNumber)) {
            setPhoneError("Số điện thoại không hợp lệ.");
            return;
          } else {
            setPhoneError("");
          }
        // Fetch user được chọn
        try {
            const res = await axios.get(`${API_URL}/${email}`);
            setUser(res.data);

            const resInvoice = await axios.get(
                `${config.API_URL}admin/getAllInvoices`
            );

            const userInvoices = resInvoice.data.invoices.filter((invoice) => {
                return invoice.userEmail === email ? invoice : null;
            });

            setData(userInvoices);
            setValidData(userInvoices);
            setPageData(userInvoices.slice(0, config.LIMIT));

            setFilters([
                {
                    name: "Trạng thái",
                    type: "status",
                    standards: ["Tất cả", "Thành công", "Đang chờ", "Hủy đơn"],
                },
                {
                    name: "Phương thức",
                    type: "paymentMethod",
                    standards: ["Tất cả", "VNPAY", "COD"],
                },
            ]);
            setInitialValues({
                lastName: { label: "Họ", type: "text", value: "" },
                firstName: { label: "Tên", type: "text", value: "" },
                email: { label: "Email", type: "email", value: "" },
                phoneNumber: {
                    label: "Số điện thoại",
                    type: "phone",
                    value: "",
                },
                password: { label: "Mật khẩu", type: "password", value: "" },
            });
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }, [email]);
    const standardSearch = ["orderCode", "username"];
    const standardSort = [
        { name: "Mã đơn", type: "orderCode" },
        { name: "Người mua", type: "username" },
        { name: "Ngày tạo", type: "createdAt" },
    ];

    // MAIN
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const formik = useFormik({
        enableReinitialize: true, // Cho phép thay đổi initialValues khi user thay đổi
        initialValues: {
            lastName: user.lastName,
            firstName: user.firstName,
            email: user.email,
            phone: user.phoneNumber,
            country: user.addresses ? user.addresses.city : "",
            city: user.addresses ? user.addresses.city : "",
            district: user.addresses ? user.addresses.district : "",
            addressLine: user.addresses ? user.addresses.addressLine : "",
        },
        validationSchema: Yup.object({
            lastName: Yup.string().required(),
            firstName: Yup.string().required(),
            email: Yup.string().required(),
            phone: Yup.string().required(),
            country: Yup.string().required(),
            city: Yup.string().required(),
            district: Yup.string().required(),
            addressLine: Yup.string().required(),
        }),
        onSubmit: async (values) => {
            try {
                Swal.fire({
                    title: "Nhắc nhở",
                    text: "Bạn có chắc chắn muốn cập nhật thông tin không?",
                    icon: "info",
                    showCancelButton: true, // Show cancel button
                    confirmButtonText: "Cập nhập!",
                    cancelButtonText: "Hủy bỏ",
                    reverseButtons: true, // Optional: makes cancel button appear on the left
                    timerProgressBar: true,
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        await axios.put(`${API_URL}/${email}`, {
                            firstName: values.firstName,
                            lastName: values.lastName,
                            phoneNumber: values.phone,
                        });
                        await axios.put(
                            `${config.API_URL}users/addresses/${user.addresses._id}`,
                            {
                                country: values.country,
                                city: values.city,
                                district: values.district,
                                addressLine: values.addressLine,
                            }
                        );
                        Swal.fire({
                            title: "Cập nhập thành công!",
                            text: "Bạn đã cập nhật thông tin thành công.",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    }
                });
            } catch (error) {
                Swal.fire({
                    title: "Cập nhập không thành công!",
                    icon: "error",
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                });
            }
        },
    });

    const handleReset = () => {
        formik.resetForm();
    };

    return (
        <div className='wrapper'>
            <header className='admin-header'>
                <div className='container'>
                    <h2>Thông tin người dùng</h2>
                </div>
            </header>
            <main className='admin-main'>
                <div className='container'>
                    <div className='card col col-4'>
                        <form onSubmit={formik.handleSubmit}>
                            <div className='modal-form-header'>
                                <h2>Thông tin chi tiết</h2>
                            </div>
                            <div className='modal-form-body'>
                                <label>Họ:</label>
                                <input
                                    type='text'
                                    name='fullName'
                                    required
                                    {...formik.getFieldProps("lastName")}
                                />
                                <label>Tên:</label>
                                <input
                                    type='text'
                                    name='firstName'
                                    required
                                    {...formik.getFieldProps("firstName")}
                                />
                                <label>Email:</label>
                                <input
                                    className='disabled'
                                    type='email'
                                    name='email'
                                    required
                                    {...formik.getFieldProps("email")}
                                    disabled
                                />
                                <label>Số điện thoại:</label>
                                <input
                                    type='phone'
                                    name='phone'
                                    required
                                    {...formik.getFieldProps("phone")}
                                />
                                <label>Quốc gia:</label>
                                <input
                                    type='text'
                                    name='country'
                                    required
                                    {...formik.getFieldProps("country")}
                                />
                                <label>Tỉnh/Thành phố:</label>
                                <input
                                    type='text'
                                    name='city'
                                    required
                                    {...formik.getFieldProps("city")}
                                />
                                <label>Quận/Huyện:</label>
                                <input
                                    type='text'
                                    name='district'
                                    required
                                    {...formik.getFieldProps("district")}
                                />
                                <label>Đường:</label>
                                <input
                                    type='text'
                                    name='addressLine'
                                    required
                                    {...formik.getFieldProps("addressLine")}
                                />
                            </div>
                            <div className='modal-form-footer'>
                                <button
                                    type='button'
                                    onClick={handleReset}
                                    className='admin-btn res-btn'
                                >
                                    Reset
                                </button>
                                <button type='submit' className='admin-btn'>
                                    Cập nhập
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className='card col col-8'>
                        <div
                            className='modal-form-header'
                            style={{ marginBottom: "70px" }}
                        >
                            <h2>Lịch sử giao dịch</h2>
                        </div>
                        <div className='card-header'>
                            <div className='card-tools'>
                                <Filter
                                    filters={filters}
                                    data={data}
                                    validData={validData}
                                    setValidData={setValidData}
                                    standardSearch={standardSearch}
                                    standardSort={standardSort}
                                />
                            </div>
                        </div>
                        <div className='card-body'>
                            <Table
                                rows={pageData}
                                columns={config.TABLE_INVOICE_COL}
                                rowLink={`/admin/user`}
                            />
                        </div>
                        <div className='card-footer'>
                            <div className='card-display-count'></div>
                            <Pagination
                                data={validData}
                                setPageData={setPageData}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminUserDetail;