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
import Table from "../../../components/admin/table/Table";
import Pagination from "../../../components/admin/pagination/Pagination";
import config from "../../../config";

const AdminInvoiceDetail = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState([]);
    const [validData, setValidData] = useState([]);
    const [pageData, setPageData] = useState([]);

    const fetchData = useCallback(async () => {
        // Fetch user được chọn
        try {
            const res = await axios.get(
                `${config.API_URL}admin/getAllInvoices`
            );
            const data = res.data.invoices.find((invoice) => {
                return invoice._id === id;
            });
            setInvoice(data);
            setValidData(data.products);
            setPageData(data.products.slice(0, config.LIMIT));
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }, [id]);

    // MAIN
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formik = useFormik({
        enableReinitialize: true, // Cho phép thay đổi initialValues khi user thay đổi
        initialValues: {
            orderCode: invoice.orderCode,
            username: invoice.username,
            discountCode: invoice.discountCode,
            totalAmount: invoice.totalAmount,
            discountAmount: invoice.discountAmount,
            amountToPay: invoice.amountToPay,
            paymentMethod: invoice.paymentMethod,
            status: invoice.status,
            createdAt: invoice.createdAt
                ? new Date(invoice.createdAt).toISOString().split("T")[0]
                : "1999-01-01",
            purchaseDate: invoice.purchaseDate
                ? new Date(invoice.purchaseDate).toISOString().split("T")[0]
                : "1999-01-01",
        },
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
                        await axios.put(
                            `${config.API_URL}invoices/updateInvoice?invoiceId=${id}`,
                            {
                                status:
                                    values.status === "Thành công"
                                        ? "success"
                                        : values.status === "Đang chờ"
                                          ? "pending"
                                          : "failed",
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
                    <h2>Thông tin đơn hàng</h2>
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
                                <label>Mã đơn</label>
                                <input
                                    className='disabled'
                                    type='text'
                                    name='orderCode'
                                    required
                                    {...formik.getFieldProps("orderCode")}
                                    disabled
                                />
                                <label>Người mua</label>
                                <input
                                    className='disabled'
                                    type='text'
                                    name='username'
                                    required
                                    {...formik.getFieldProps("username")}
                                    disabled
                                />
                                <label>Mã giảm giá</label>
                                <input
                                    className='disabled'
                                    type='text'
                                    name='discountCode'
                                    required
                                    {...formik.getFieldProps("discountCode")}
                                    disabled
                                />
                                <label>Tổng giá trị sản phẩm</label>
                                <input
                                    className='disabled'
                                    type='number'
                                    name='totalAmount'
                                    required
                                    {...formik.getFieldProps("totalAmount")}
                                    disabled
                                />
                                <label>Giảm giá</label>
                                <input
                                    className='disabled'
                                    type='number'
                                    name='discountAmount'
                                    required
                                    {...formik.getFieldProps("discountAmount")}
                                    disabled
                                />
                                <label>Giá trị đơn hàng</label>
                                <input
                                    className='disabled'
                                    type='number'
                                    name='amountToPay'
                                    required
                                    {...formik.getFieldProps("amountToPay")}
                                    disabled
                                />
                                <label>Phương thức thanh toán </label>
                                <select
                                    className='disabled'
                                    name='paymentMethod'
                                    {...formik.getFieldProps("paymentMethod")}
                                    disabled
                                >
                                    <option
                                        value={"VNPAY"}
                                        label={"VNPAY"}
                                    ></option>
                                    <option
                                        value={"COD"}
                                        label={"COD"}
                                    ></option>
                                </select>
                                <label>Trạng thái </label>
                                <select
                                    name='status'
                                    {...formik.getFieldProps("status")}
                                >
                                    <option
                                        value={"Thành công"}
                                        label={"Thành công"}
                                    ></option>
                                    <option
                                        value={"Đang chờ"}
                                        label={"Đang chờ"}
                                    ></option>
                                    <option
                                        value={"Hủy đơn"}
                                        label={"Hủy đơn"}
                                    ></option>
                                </select>
                                <label>Ngày tạo đơn</label>
                                <input
                                    className='disabled'
                                    type='date'
                                    name='createdAt'
                                    required
                                    {...formik.getFieldProps("createdAt")}
                                    disabled
                                />
                                <label>Ngày thanh toán</label>
                                <input
                                    className='disabled'
                                    type='date'
                                    name='purchaseDate'
                                    required
                                    {...formik.getFieldProps("purchaseDate")}
                                    disabled
                                />
                            </div>
                            <div className='modal-form-footer'>
                                <button type='submit' className='admin-btn'>
                                    Cập nhập
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className='card col col-8'>
                        <div className='modal-form-header'>
                            <h2>Danh sách sản phẩm</h2>
                        </div>
                        <div className='card-header'></div>
                        <div className='card-body'>
                            <Table
                                rows={pageData}
                                columns={config.SHORT_TABLE_PRODUCT_COL}
                                rowLink={`/admin/product`}
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

export default AdminInvoiceDetail;