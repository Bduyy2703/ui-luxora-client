import { DefaultProfile, HeaderOnly } from "../components/Layout";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Profile from "../pages/Register";
import Upload from "../pages/Upload";
import Search from "../pages/Search";
import ProfileUser from "../pages/ProfileUser/pageProfile/profileUser";
import CartUser from "../pages/ProfileUser/pageCart/cartUser";
import PasswordUser from "../pages/ProfileUser/pagePassword/passwordUser";
import AddressesUser from "../pages/ProfileUser/pageAddresses/addressesUser";
import Register from "../pages/Register";
import VerifyRegister from "../pages/VerifyRegister";
import CartPage from "../pages/CartPage";
import { DetailProduct } from "../pages/DetailProduct/DetailProduct";
import ProductList from "../pages/ProductList";
import VerifyOTP from "../pages/VerifyRegister";
import ResetPassword from "../pages/ResetPassword";
import Checkout from "../pages/Checkout";
import PaymentSuccess from "../pages/PaymentSuccess";
import InvoiceDetail from "../pages/invoiceDetail";
import ThankYou from "../pages/PaymentSuccess";

// Middleware để kiểm tra đăng nhập
function requireAuth(to, from, next) {
  const token = localStorage.getItem('decodedToken');
  if (token === 'user') {
    next(); // Cho phép truy cập
  } else {
    next('/login'); // Chuyển hướng đến trang đăng nhập
  }
}

// không cần đăng nhập vẫn xem được
const publicRoutes = [
  { path: "/", component: Home },
  { path: "/register", component: Register },
  { path: "/verifyRegister", component: VerifyRegister },
  { path: "/login", component: Login },
  { path: "/search", component: Search, layout: null },
  { path: "/upload", component: Upload, layout: HeaderOnly },
  // {
  //   path: "/account",
  //   component: ProfileUser,
  //   layout: DefaultProfile
  // },
  // { path: "/account/orders", component: CartUser, layout: DefaultProfile },
  // {
  //   path: "/account/changepassword",
  //   component: PasswordUser,
  //   layout: DefaultProfile,
  // },
  // {
  //   path: "/account/addresses",
  //   component: AddressesUser,
  //   layout: DefaultProfile,
  // },
  { path: "/cart/gio-hang-cua-ban", component: CartPage },
  { path: "/otp", component: VerifyRegister },
  { path: "/detail-product/:id", component: DetailProduct },
  { path: "/list-product", component: ProductList },
  { path: "/reset-password", component: ResetPassword },
  { path: "/checkout", component: Checkout, layout: null },
  { path: "/payment-success", component: ThankYou, layout: null },

];

// ví dụ phải đăng nhập mới xem được
const privateRoutes = [
  { path: "/account", component: ProfileUser, layout: DefaultProfile, beforeEnter: requireAuth },
  { path: "/account/orders", component: CartUser, layout: DefaultProfile, beforeEnter: requireAuth },
  { path: "/account/changepassword", component: PasswordUser, layout: DefaultProfile, beforeEnter: requireAuth },
  { path: "/account/addresses", component: AddressesUser, layout: DefaultProfile, beforeEnter: requireAuth },
  { path: "/account/orders/invoice-detail", component: InvoiceDetail, layout: DefaultProfile, beforeEnter: requireAuth },
];

export { publicRoutes, privateRoutes };
