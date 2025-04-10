import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Đăng ký thành phần Chart.js    
ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

const LineChart = ({ title, label, chartData }) => {
    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: label,
                data: chartData.data,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.25,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: title,
            },
        },
        scales: {
            x: {
                ticks: {
                    display: false, // Ẩn nhãn trên trục hoành
                },
                grid: {
                    display: false, // (Tùy chọn) Ẩn lưới ngang
                },
            },
            y: {
                type: "linear",
                beginAtZero: true,
            },
        },
    };

    return <Line data={data} options={options} />;
};

export default LineChart;