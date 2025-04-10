import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import * as Yup from "yup";
import Swal from "sweetalert2";
import Pagination from "../../../components/admin/pagination/Pagination";
import Table from "../../../components/admin/table/Table";
import Filter from "../../../components/admin/filter/Filter";
import Modal from "../../../components/admin/modal/Modal";
import config from "../../../config";

const AdminInvoiceList = () => {
    const API_URL = `${config.API_URL}admin`;
    const [data, setData] = useState([]);
    const [validData, setValidData] = useState([]);
    const [pageData, setPageData] = useState([]);
    const [filters, setFilters] = useState([]);
    const [initialValues, setInitialValues] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/getAllInvoices`);
            setData(res.data.invoices);
            setValidData(res.data.invoices);
            setPageData(res.data.invoices.slice(0, config.LIMIT));

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
            console.error("Error fetching invoices:", error);
        }
    }, [API_URL]);
    const standardSearch = ["orderCode", "username"];
    const standardSort = [
        { name: "Mã đơn", type: "orderCode" },
        { name: "Người mua", type: "username" },
        { name: "Ngày tạo", type: "createdAt" },
    ];

    const validationSchema = Yup.object(
        Object.keys(initialValues).reduce((schema, field) => {
            schema[field] = Yup.string().required(
                `${initialValues[field].label} là bắt buộc`
            );
            return schema;
        }, {})
    );

    useEffect(() => {
        fetchData(); // Gọi hàm fetchData
    }, [fetchData]);
    return (
        <div className='wrapper'>
            <header className='admin-header'>
                <div className='container'>
                    <h2>QUẢN LÝ ĐƠN HÀNG</h2>
                </div>
            </header>
            <main className='main'>
                <div className='container'>
                    <div className='card'>
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
                                rowLink={`/admin/invoice`}
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

export default AdminInvoiceList;