import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import * as Yup from "yup";
import Swal from "sweetalert2";
import Pagination from "../../../components/admin/pagination/Pagination";
import Table from "../../../components/admin/table/Table";
import Filter from "../../../components/admin/filter/Filter";
import Modal from "../../../components/admin/modal/Modal";
import LineChart from "../../../components/admin/lineChart/LineChart";
import config from "../../../config";

const AdminStatis = () => {
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [invoicesYear, setInvoicesYear] = useState([]);
    const [revenueData, setRevenueData] = useState({});
    const [invoiceData, setInvoiceData] = useState({});
    const [userData, setUserData] = useState({});
    const [topProduct, setTopProduct] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const res = await axios.get(
                `${config.API_URL}admin/getAllInvoices`
            );
            setInvoices(res.data.invoices);

            const resPro = await axios.get(
                `${config.API_URL}admin/getAllProducts`
            );
            setProducts(resPro.data.products);

            const resUser = await axios.get(`${config.API_URL}admin/users`);
            setUsers(resUser.data.users);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, []);

    useEffect(() => {
        fetchData(); // Gọi hàm fetchData
    }, [fetchData]);

    useEffect(() => {
        setInvoicesYear(getYearsFromOrders(invoices));

        setRevenueData(calcRevenueData(invoices, selectedMonth, selectedYear));

        console.log(calcRevenueData(invoices, selectedMonth, selectedYear));

        setInvoiceData(calcInvoiceData(invoices, selectedMonth, selectedYear));

        setUserData(calcUserData(users, selectedMonth, selectedYear));

        const top10Product = getTop5Product(
            invoices,
            selectedMonth,
            selectedYear
        );
        setTopProduct(
            top10Product.reduce((r, topP) => {
                // Duyệt qua tất cả sản phẩm trong products
                products.forEach((p) => {
                    if (p._id === topP.pid) {
                        // Thêm sản phẩm vào mảng kết quả
                        r.push({
                            _id: p._id,
                            code: p.product_code,
                            name: p.product_name,
                            quantity: topP.quantity,
                        });
                    }
                });
                return r;
            }, [])
        );
    }, [invoices, users, selectedMonth, selectedYear]);

    const handleMonthChange = (event) => {
        setSelectedMonth(Number(event.target.value));
    };
    const handleYearChange = (event) => {
        setSelectedYear(Number(event.target.value));
    };

    return (
        <div className='wrapper'>
            <header className='admin-header'>
                <div className='container'>
                    <h2>THỐNG KÊ</h2>
                    <div
                        style={{
                            display: "flex",
                            flex: "1",
                            justifyContent: "flex-end",
                            gap: "15px",
                        }}
                    >
                        <select
                            name='monthSelect'
                            defaultValue={selectedMonth}
                            onChange={handleMonthChange}
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
                                (m) => (
                                    <option
                                        key={m}
                                        value={m}
                                        label={`Tháng ${m}`}
                                    />
                                )
                            )}
                        </select>
                        <select
                            name='yearSelect'
                            defaultValue={selectedYear}
                            onChange={handleYearChange}
                        >
                            {invoicesYear.map((y) => (
                                <option key={y} value={y} label={`Năm ${y}`} />
                            ))}
                        </select>
                    </div>
                </div>
            </header>
            <main className='main'>
                <div className='container'>
                    <div className=' col col 6'>
                        <div className='card'>
                            <div className='card-header'>
                                <h2>DOANH THU</h2>
                                <div className='card-btns'>
                                    <h2>
                                        Tổng:{" "}
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(Number(revenueData.total))}
                                    </h2>
                                </div>
                            </div>
                            <div className='card-body'>
                                <LineChart
                                    title={`Biểu đồ doanh thu tháng ${selectedMonth}, năm ${selectedYear}`}
                                    label='Doanh thu'
                                    chartData={revenueData}
                                />
                            </div>
                        </div>
                        <div className='card'>
                            <div className='card-header'>
                                <h2>TỔNG ĐƠN HÀNG</h2>
                                <div className='card-btns'>
                                    <h2>Tổng: {invoiceData.total} đơn</h2>
                                </div>
                            </div>
                            <div className='card-body'>
                                <LineChart
                                    title={`Biểu đồ tổng đơn hàng tháng ${selectedMonth}, năm ${selectedYear}`}
                                    label='Đơn'
                                    chartData={invoiceData}
                                />
                            </div>
                        </div>
                    </div>
                    <div className=' col col 6'>
                        <div className='card'>
                            <div className='card-header'>
                                <h2>SẢN PHẨM BÁN CHẠY</h2>
                            </div>
                            <div className='card-body'>
                                <Table
                                    rows={topProduct}
                                    columns={config.TABLE_STATIS_PRO_COL}
                                />
                            </div>
                        </div>
                        <div className='card'>
                            <div className='card-header'>
                                <h2>NGƯỜI DÙNG MỚI</h2>
                                <div className='card-btns'>
                                    <h2>Tổng: {userData.total} người dùng</h2>
                                </div>
                            </div>
                            <div className='card-body'>
                                <LineChart
                                    title={`Biểu đồ người dùng mới tháng ${selectedMonth}, năm ${selectedYear}`}
                                    label='Người dùng'
                                    chartData={userData}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const getDayFromMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
};
function filterDataByMonthAndYear(orders, month, year) {
    return orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
            orderDate.getMonth() + 1 === month && // Tháng trong JavaScript là 0-11, cần +1
            orderDate.getFullYear() === year
        );
    });
}
function getYearsFromOrders(orders) {
    const years = orders
        .map((order) => {
            const orderDate = new Date(order.createdAt);
            // Kiểm tra nếu createdAt là giá trị hợp lệ
            if (isNaN(orderDate)) {
                return null;
            }

            return orderDate.getFullYear();
        })
        .filter((year) => year !== null); // Lọc bỏ các giá trị null không hợp lệ

    return Array.from(new Set(years)).sort((a, b) => b - a); // Loại bỏ trùng và sắp xếp tăng dần
}
function calcRevenueData(orders, month, year) {
    const filteredOrders = filterDataByMonthAndYear(orders, month, year);

    // Doanh thu theo ngày
    const dailyRevenue = new Array(getDayFromMonth(month, year)).fill(0);
    filteredOrders.forEach((o) => {
        const orderDay = new Date(o.createdAt).getDate() - 1;

        dailyRevenue[orderDay ] += o.amountToPay;
    });

    // Tổng doanh thu
    const totalRevenue = Object.values(dailyRevenue).reduce(
        (sum, revenue) => sum + revenue,
        0
    );
    return {
        labels: Array.from(
            { length: getDayFromMonth(month, year) },
            (_, i) => `Ngày ${i + 1}`
        ),
        data: dailyRevenue,
        total: totalRevenue,
    };
}
function calcInvoiceData(orders, month, year) {
    const filteredOrders = filterDataByMonthAndYear(orders, month, year);

    // Đơn hàng theo ngày
    const dailyInvoice = new Array(getDayFromMonth(month, year)).fill(0);
    filteredOrders.forEach((o) => {
        const orderDay = new Date(o.createdAt).getDate() - 1;

        dailyInvoice[orderDay ] += 1;
    });

    // Tổng đơn hàng
    const totalInvoice = Object.values(dailyInvoice).reduce(
        (sum, i) => sum + i,
        0
    );
    return {
        labels: Array.from(
            { length: getDayFromMonth(month, year) },
            (_, i) => `Ngày ${i + 1}`
        ),
        data: dailyInvoice,
        total: totalInvoice,
    };
}
function calcUserData(users, month, year) {
    const filteredUsers = filterDataByMonthAndYear(users, month, year);

    // Đơn hàng theo ngày
    const dailyRegister = new Array(getDayFromMonth(month, year)).fill(0);
    filteredUsers.forEach((o) => {
        const regisDay = new Date(o.createdAt).getDate() - 1;

        dailyRegister[regisDay] += 1;
    });

    // Tổng lượt đăng ký
    const totalRegister = Object.values(dailyRegister).reduce(
        (sum, i) => sum + i,
        0
    );
    return {
        labels: Array.from(
            { length: getDayFromMonth(month, year) },
            (_, i) => `Ngày ${i + 1}`
        ),
        data: dailyRegister,
        total: totalRegister,
    };
}
function getTop5Product(orders, month, year) {
    const filteredOrders = filterDataByMonthAndYear(orders, month, year);

    const products = [];
    filteredOrders.forEach((order) => {
        order.products.forEach((p) => {
            if (products[p._id]) {
                products[p._id] += 1;
            } else {
                products[p._id] = 1;
            }
        });
    });

    // Chuyển đổi đối tượng thành mảng các đối tượng có cấu trúc mới
    const formattedProducts = Object.entries(products).map(
        ([pid, quantity]) => ({
            pid,
            quantity,
        })
    );
    return formattedProducts.slice(0, 5).sort((a,b)=> b.quantity-a.quantity);
}

export default AdminStatis;