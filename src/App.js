import { Fragment } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { publicRoutes, privateRoutes } from "./routes";
import { DefaultLayout } from "./components/Layout";

import AdminLayout from "./components/Layout/AdminLayout/AdminLayout";
import AdminUserList from "./pages/admin/user/AdminUserList";
import AdminUserDetail from "./pages/admin/user/AdminUserDetail";
import AdminProductList from "./pages/admin/product/AdminProductList";
import AdminProductDetail from "./pages/admin/product/AdminProductDetail";
import AdminCateList from "./pages/admin/category/AdminCateList";
import AdminInvoiceList from "./pages/admin/invoice/AdminInvoiceList";
import AdminInventoryList from "./pages/admin/inventory/AdminInventoryList";
import AdminInvoiceDetail from "./pages/admin/invoice/AdminInvoiceDetail";
import AdminDiscountList from "./pages/admin/discount/AdminDiscountList";
import AdminStatis from "./pages/admin/statis/AdminStatis";

function requireAuth({ children }) {
  const token = localStorage.getItem("decodedToken");

  return token ? children : <Navigate to="/login" />;
}

function RequireAdmin({ children }) {
  const decodedToken = localStorage.getItem("decodedToken");
  const isAdmin = decodedToken === "admin";

  return isAdmin ? (
    children
  ) : (
    <div>Bạn không phải admin, vui lòng đăng nhập với tài khoản admin.</div>
  );
}

function App() {
  const decodedToken = localStorage.getItem("decodedToken");
  return (
    <Router>
      <Routes>
        {publicRoutes.map((route, index) => {
          const Page = route.component;

          let Layout = DefaultLayout;

          if (route.layout) {
            Layout = route.layout;
          } else if (route.layout === null) {
            Layout = Fragment;
          }

          return (
            <Route
              key={index}
              path={route.path}
              element={
                <Layout>
                  <Page />
                </Layout>
              }
            />
          );
        })}
        {privateRoutes.map((route, index) => {
          const Page = route.component;

          let Layout = DefaultLayout;

          if (route.layout) {
            Layout = route.layout;
          }

          return (
            <Route
              key={index}
              path={route.path}
              element={
                <requireAuth>
                  <Layout>
                    <Page />
                  </Layout>
                </requireAuth>
              }
            />
          );
        })}
        <Route path="/admin/" element={<AdminLayout />}>
          <Route index element={<AdminUserList />} />
          {/* ADMIN USER */}
          <Route path="/admin/user" element={<AdminUserList />} />
          <Route path="/admin/user/:email" element={<AdminUserDetail />} />
          {/* ADMIN PRODUCT */}
          <Route path="/admin/product" element={<AdminProductList />} />
          <Route path="/admin/product/:id" element={<AdminProductDetail />} />
          {/* ADMIN CATEGORY */}
          <Route path="/admin/cate" element={<AdminCateList />} />
          {/* ADMIN INVOICE */}
          <Route path="/admin/invoice" element={<AdminInvoiceList />} />
          <Route path="/admin/invoice/:id" element={<AdminInvoiceDetail />} />
          {/* ADMIN INVENTORY */}
          <Route path="/admin/inventory" element={<AdminInventoryList />} />
          {/* ADMIN DISCOUNT */}
          <Route path="/admin/discount" element={<AdminDiscountList />} />
          {/* ADMIN STATIS */}
          <Route path="/admin/statis" element={<AdminStatis />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
