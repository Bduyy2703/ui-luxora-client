import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../admin/sidebar/Sidebar";
import "./admin.css";

const AdminLayout = () => {
    return (
        <div className='admin-layout'>
            <Sidebar />

            <Outlet />
        </div>
    );
};

export default AdminLayout;
