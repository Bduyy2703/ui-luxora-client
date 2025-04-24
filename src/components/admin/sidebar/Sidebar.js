import {
  BarChartOutlined,
  LogoutOutlined,
  PercentageOutlined,
  ShoppingOutlined,
  StarOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Menu } from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logOut } from "../../../services/api/authService";
import "./sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const lastPathSegment = location.pathname.split("/").pop();

  const [selectedKeys, setSelectedKeys] = useState([lastPathSegment]);
  const [openKeys, setOpenKeys] = useState([]);

  useEffect(() => {
    setSelectedKeys([lastPathSegment]);
    const parentKey = items.find((item) =>
      item.children?.some((child) => child.key === lastPathSegment),
    )?.key;
    if (parentKey && !openKeys.includes(parentKey)) {
      setOpenKeys([parentKey]);
    }
  }, [lastPathSegment]);

  const handleMenuSelect = ({ key }) => {
    setSelectedKeys([key]);
  };

  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const handleLogout = async () => {
    const result = await logOut();
    if (!result.error) {
      navigate("/"); 
    } else {
      console.error("Logout failed:", result.error);
    }
  };

  const items = [
    {
      key: "user",
      icon: <UserOutlined />,
      label: "Quản lý người dùng",
      children: [
        {
          key: "user",
          label: <Link to="/admin/user">Danh sách người dùng</Link>,
        },
        {
          key: "blog",
          label: <Link to="/admin/blog">Blog</Link>,
        },
      ],
    },
    {
      key: "products",
      icon: <ShoppingOutlined />,
      label: "Quản lý sản phẩm",
      children: [
        {
          key: "product",
          label: <Link to="/admin/product">Sản phẩm</Link>,
        },
        {
          key: "cate",
          label: <Link to="/admin/cate">Danh mục</Link>,
        },
        {
          key: "invoice",
          label: <Link to="/admin/invoice">Đơn hàng</Link>,
        },
        {
          key: "inventory",
          label: <Link to="/admin/inventory">Chi nhánh</Link>,
        },
      ],
    },
    {
      key: "discount",
      icon: <PercentageOutlined />,
      label: "Quản lý giảm giá",
      children: [
        {
          key: "discount",
          label: <Link to="/admin/discount">Mã giảm giá</Link>,
        },
        {
          key: "promotion",
          label: <Link to="/admin/promotion">Chương trình khuyến mãi</Link>,
        },
      ],
    },
    {
      key: "reviews",
      icon: <StarOutlined />,
      label: <Link to="/admin/reviews">Đánh giá</Link>,
    },
    {
      key: "statis",
      icon: <BarChartOutlined />,
      label: <Link to="/admin/statis">Thống kê</Link>,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="info">
        <div className="logo">
          <img
            width="230"
            height="50"
            src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/logo.png"
            alt="Caraluna"
          />
        </div>
        <a href="#" onClick={handleLogout}>
          <LogoutOutlined style={{ marginRight: "8px" }} />
          Đăng xuất
        </a>
      </div>
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onSelect={handleMenuSelect}
        onOpenChange={handleOpenChange}
        style={{
          height: "100%",
          borderRight: 0,
          marginTop: "-15px",
        }}
        items={items}
      />
    </aside>
  );
};

export default Sidebar;