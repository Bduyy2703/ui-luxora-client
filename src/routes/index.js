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
import InvoiceDetail from "../pages/invoiceDetail";
import ThankYou from "../pages/ConfirmSuccess";
import BlogsListPage from "../pages/blogs";
import PaymentSuccess from "../pages/PaymentSuccess";
import WishListPage from "../pages/ProfileUser/pageWishList/wishList";
import BlogList from "../pages/blogs/BlogList";
import TermsOfService from "../components/Layout/components/Footer/termOfService";
import ShoppingGuide from "../components/Layout/components/Footer/ShoppingGuide";
import PaymentGuide from "../components/Layout/components/Footer/PaymentGuide";
import PrivacyPolicy from "../components/Layout/components/Footer/PrivacyPolicy";
import WarrantyPolicy from "../components/Layout/components/Footer/WarrantyPolicy";
import ReturnPolicy from "../components/Layout/components/Footer/ReturnPolicy";
import ShippingPolicy from "../components/Layout/components/Footer/ShippingPolicy";

function requireAuth(to, from, next) {
  const token = localStorage.getItem("decodedToken");
  if (token === "user") {
    next();
  } else {
    next("/login");
  }
}

const publicRoutes = [
  { path: "/", component: Home },
  { path: "/register", component: Register, layout: null },
  { path: "/verifyRegister", component: VerifyRegister },
  { path: "/login", component: Login, layout: null },
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
  { path: "/list-blog", component: BlogList },
  { path: "/blog/:id", component: BlogsListPage },
  { path: "/reset-password", component: ResetPassword },
  { path: "/terms-of-service", component: TermsOfService },
  { path: "/shopping-guide", component: ShoppingGuide },
  { path: "/payment-guide", component: PaymentGuide },
  { path: "/privacy-policy", component: PrivacyPolicy },
  { path: "/warranty-policy", component: WarrantyPolicy },
  { path: "/return-policy", component: ReturnPolicy },
  { path: "/shipping-policy", component: ShippingPolicy },
  { path: "/checkout", component: Checkout, layout: null },
  { path: "/confirm-success", component: ThankYou, layout: null },
  { path: "/payment-success", component: PaymentSuccess, layout: null },
];

// ví dụ phải đăng nhập mới xem được
const privateRoutes = [
  {
    path: "/account",
    component: ProfileUser,
    layout: DefaultProfile,
    beforeEnter: requireAuth,
  },
  {
    path: "/account/orders",
    component: CartUser,
    layout: DefaultProfile,
    beforeEnter: requireAuth,
  },
  {
    path: "/account/wishlist",
    component: WishListPage,
    layout: DefaultProfile,
    beforeEnter: requireAuth,
  },
  {
    path: "/account/changepassword",
    component: PasswordUser,
    layout: DefaultProfile,
    beforeEnter: requireAuth,
  },
  {
    path: "/account/addresses",
    component: AddressesUser,
    layout: DefaultProfile,
    beforeEnter: requireAuth,
  },
  {
    path: "/account/orders/invoice-detail",
    component: InvoiceDetail,
    layout: DefaultProfile,
    beforeEnter: requireAuth,
  },
];

export { publicRoutes, privateRoutes };
