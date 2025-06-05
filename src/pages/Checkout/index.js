// import React, { useState, useEffect, useCallback } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import styles from "./Checkout.module.scss";
// import Breadcrumb from "../../components/Breadcrumb";
// import { getAddresses } from "../../services/api/userService";
// import {
//   calculateShipping,
//   getAvailableDiscounts,
// } from "../../services/api/cartService";
// import {
//   notification,
//   Radio,
//   Button,
//   Modal,
//   Form,
//   Input,
//   Checkbox,
//   Skeleton,
//   Tooltip,
// } from "antd";
// import { debounce } from "lodash";
// import placeholderImage from "../../assets/images/daychuyen1/vyn13-t-1-1659674319051.webp";
// import privateAxios from "../../services/api/privateAxios";
// import {
//   UserOutlined,
//   MailOutlined,
//   PhoneOutlined,
//   PlusOutlined,
//   InfoCircleOutlined,
// } from "@ant-design/icons";
// import Particles from "@tsparticles/react";
// import { loadAll } from "@tsparticles/all";

// const CheckoutPage = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const paymentData = state?.paymentData || {};
//   const user = paymentData.usercheckout || {};
//   const checkoutItems = paymentData.checkoutItems || [];
//   const totalAmount = paymentData.totalAmount || 0;

//   const [addresses, setAddresses] = useState([]);
//   const [selectedAddress, setSelectedAddress] = useState(null);
//   const [paymentMethod, setPaymentMethod] = useState("COD");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [form] = Form.useForm();
//   const [shippingFee, setShippingFee] = useState(0);
//   const [availableDiscounts, setAvailableDiscounts] = useState([]);
//   const [selectedDiscounts, setSelectedDiscounts] = useState({
//     TOTAL: null,
//     SHIPPING: null,
//   });
//   const [loadingAddresses, setLoadingAddresses] = useState(true);
//   const [loadingDiscounts, setLoadingDiscounts] = useState(true);
//   const [loadingShipping, setLoadingShipping] = useState({});

//   const particlesInit = async (engine) => {
//     await loadAll(engine);
//   };

//   const breadcrumbItems = [
//     { label: "Trang chủ", path: "/" },
//     { label: "Giỏ hàng", path: "/cart/gio-hang-cua-ban" },
//     { label: "Thanh toán" },
//   ];

//   const calculateDiscountAmount = () => {
//     let productDiscount = 0;
//     let shippingFreeDiscount = 0;

//     if (selectedDiscounts.TOTAL) {
//       const discount = selectedDiscounts.TOTAL;
//       if (discount.discountType === "PERCENTAGE") {
//         productDiscount += Math.round(
//           (totalAmount * parseFloat(discount.discountValue)) / 100,
//         );
//       } else if (discount.discountType === "FIXED") {
//         productDiscount += parseFloat(discount.discountValue);
//       }
//     }

//     if (selectedDiscounts.SHIPPING) {
//       const discount = selectedDiscounts.SHIPPING;
//       let calculatedDiscount = 0;
//       if (discount.discountType === "PERCENTAGE") {
//         calculatedDiscount = Math.round(
//           (shippingFee * parseFloat(discount.discountValue)) / 100,
//         );
//       } else if (discount.discountType === "FIXED") {
//         calculatedDiscount = parseFloat(discount.discountValue);
//       }
//       shippingFreeDiscount = Math.min(calculatedDiscount, shippingFee);
//     }

//     return { productDiscount, shippingFreeDiscount };
//   };

//   const { productDiscount, shippingFreeDiscount } = calculateDiscountAmount();
//   const finalTotal =
//     totalAmount + shippingFee - (productDiscount + shippingFreeDiscount);

//   useEffect(() => {
//     const fetchAddresses = async () => {
//       setLoadingAddresses(true);
//       try {
//         const response = await getAddresses();
//         setAddresses(response || []);
//         setShippingFee(0);
//       } catch (error) {
//         notification.error({
//           message: "Thông báo",
//           description: "Không thể tải danh sách địa chỉ, vui lòng thử lại",
//           duration: 3,
//         });
//         setShippingFee(0);
//       } finally {
//         setLoadingAddresses(false);
//       }
//     };
//     fetchAddresses();
//   }, []);

//   const fetchAvailableDiscounts = useCallback(
//     debounce(async () => {
//       setLoadingDiscounts(true);
//       try {
//         const response = await getAvailableDiscounts({
//           totalAmount,
//           shippingFee,
//         });
//         setAvailableDiscounts(response || []);
//         if (!response || response.length === 0) {
//           setSelectedDiscounts({ TOTAL: null, SHIPPING: null });
//         }
//       } catch (error) {
//         notification.error({
//           message: "Thông báo",
//           description: "Không thể lấy danh sách mã giảm giá, vui lòng thử lại",
//           duration: 3,
//         });
//         setAvailableDiscounts([]);
//         setSelectedDiscounts({ TOTAL: null, SHIPPING: null });
//       } finally {
//         setLoadingDiscounts(false);
//       }
//     }, 500),
//     [totalAmount, shippingFee],
//   );

//   useEffect(() => {
//     if (totalAmount > 0) {
//       fetchAvailableDiscounts();
//     } else {
//       setAvailableDiscounts([]);
//       setSelectedDiscounts({ TOTAL: null, SHIPPING: null });
//       setLoadingDiscounts(false);
//     }
//   }, [totalAmount, shippingFee, fetchAvailableDiscounts]);

//   const handleSelectDiscount = (discount) => {
//     const condition = discount.condition;
//     setSelectedDiscounts((prev) => {
//       if (prev[condition]?.id === discount.id) {
//         return { ...prev, [condition]: null };
//       } else {
//         return { ...prev, [condition]: discount };
//       }
//     });
//   };

//   const handleSelectAddress = async (addressId) => {
//     setSelectedAddress(addressId);
//     setLoadingShipping((prev) => ({ ...prev, [addressId]: true }));
//     const address = addresses.find((addr) => addr.id === addressId);
//     if (address && checkoutItems?.length > 0) {
//       if (
//         address.street &&
//         address.city &&
//         address.country &&
//         checkoutItems.every((item) => item.productDetails?.id)
//       ) {
//         try {
//           const response = await calculateShipping({
//             checkoutItems: checkoutItems.map((item) => ({
//               productDetailId: item.productDetails.id,
//               quantity: item.quantity,
//             })),
//             totalAmount,
//             address: {
//               street: address.street,
//               city: address.city,
//               country: address.country,
//             },
//           });
//           setShippingFee(response.shippingFee || 0);
//           notification.success({
//             message: "Thông báo",
//             description: "Đã tính phí vận chuyển thành công",
//             duration: 2,
//           });
//         } catch (error) {
//           notification.error({
//             message: "Thông báo",
//             description: "Không thể tính phí vận chuyển, vui lòng thử lại",
//             duration: 3,
//           });
//           setShippingFee(0);
//         } finally {
//           setLoadingShipping((prev) => ({ ...prev, [addressId]: false }));
//         }
//       } else {
//         setShippingFee(0);
//         setLoadingShipping((prev) => ({ ...prev, [addressId]: false }));
//       }
//     } else {
//       setShippingFee(0);
//       setLoadingShipping((prev) => ({ ...prev, [addressId]: false }));
//     }
//   };

//   const handleAddAddress = async (values) => {
//     try {
//       const newAddress = {
//         id: `temp-${Date.now()}`,
//         street: values.street,
//         city: values.city,
//         country: values.country,
//       };
//       setAddresses([...addresses, newAddress]);
//       setSelectedAddress(newAddress.id);
//       if (checkoutItems?.length > 0) {
//         try {
//           const response = await calculateShipping({
//             checkoutItems: checkoutItems.map((item) => ({
//               productDetailId: item.productDetails.id,
//               quantity: item.quantity,
//             })),
//             totalAmount,
//             address: {
//               street: newAddress.street,
//               city: newAddress.city,
//               country: newAddress.country,
//             },
//           });
//           setShippingFee(response.shippingFee || 0);
//         } catch (error) {
//           notification.error({
//             message: "Thông báo",
//             description: "Không thể tính phí vận chuyển, vui lòng thử lại",
//             duration: 3,
//           });
//           setShippingFee(0);
//         }
//       } else {
//         setShippingFee(0);
//       }
//       setIsModalVisible(false);
//       form.resetFields();
//       notification.success({
//         message: "Thông báo",
//         description: "Thêm địa chỉ thành công",
//         duration: 3,
//       });
//     } catch (error) {
//       notification.error({
//         message: "Thông báo",
//         description: "Thêm địa chỉ thất bại, vui lòng thử lại",
//         duration: 3,
//       });
//     }
//   };

//   const handleConfirmCheckout = async () => {
//     if (!selectedAddress) {
//       notification.error({
//         message: "Thông báo",
//         description: "Vui lòng chọn hoặc thêm một địa chỉ giao hàng",
//         duration: 3,
//       });
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const address = addresses.find((addr) => addr.id === selectedAddress);
//       if (!address) {
//         notification.error({
//           message: "Thông báo",
//           description: "Địa chỉ không hợp lệ, vui lòng thử lại",
//           duration: 3,
//         });
//         setIsLoading(false);
//         return;
//       }

//       const addressData = String(address.id).startsWith("temp-")
//         ? {
//             street: address.street,
//             city: address.city,
//             country: address.country,
//           }
//         : {
//             id: address.id,
//             street: address.street,
//             city: address.city,
//             country: address.country,
//           };

//       const validatedProductDiscount = selectedDiscounts.TOTAL
//         ? productDiscount
//         : 0;
//       const validatedShippingFeeDiscount = selectedDiscounts.SHIPPING
//         ? Math.max(0, Math.round(shippingFreeDiscount))
//         : 0;

//       const discountIds = [];
//       if (selectedDiscounts.TOTAL) {
//         discountIds.push(selectedDiscounts.TOTAL.id);
//       }
//       if (selectedDiscounts.SHIPPING) {
//         discountIds.push(selectedDiscounts.SHIPPING.id);
//       }

//       const payload = {
//         userId: user.id,
//         productDetails: checkoutItems.map((item) => ({
//           productDetailId: item.productDetails.id,
//           quantity: item.quantity,
//         })),
//         address: addressData,
//         paymentMethod,
//         totalProductAmount: totalAmount,
//         shippingFee,
//         shippingFeeDiscount: validatedShippingFeeDiscount,
//         productDiscount: validatedProductDiscount,
//         finalTotal:
//           totalAmount +
//           shippingFee -
//           (validatedProductDiscount + validatedShippingFeeDiscount),
//         discountIds,
//       };

//       const response = await privateAxios.post("/v1/payment/checkout", payload);

//       if (paymentMethod === "VNPAY" && response.data.paymentUrl) {
//         window.location.href = response.data.paymentUrl;
//       } else {
//         notification.success({
//           message: "Thông báo",
//           description: response.data.message || "Xác nhận đơn hàng thành công",
//           duration: 3,
//         });
//         navigate("/account/orders/invoice-detail");
//       }
//     } catch (error) {
//       notification.error({
//         message: "Thông báo",
//         description:
//           error.response?.data?.message ||
//           "Xác nhận thanh toán thất bại, vui lòng thử lại",
//         duration: 3,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       <Particles
//         id="tsparticles"
//         init={particlesInit}
//         options={{
//           background: {
//             color: {
//               value: "transparent",
//             },
//           },
//           fpsLimit: 120,
//           particles: {
//             number: {
//               value: 50,
//               density: {
//                 enable: true,
//                 area: 800,
//               },
//             },
//             color: {
//               value: "#f1c40f",
//             },
//             shape: {
//               type: "circle",
//             },
//             opacity: {
//               value: { min: 0.3, max: 0.7 },
//               random: true,
//             },
//             size: {
//               value: { min: 1, max: 3 },
//               random: true,
//             },
//             move: {
//               enable: true,
//               speed: { min: 0.5, max: 1 },
//               direction: "none",
//               random: false,
//               straight: false,
//               outModes: "out",
//               bounce: false,
//             },
//           },
//           detectRetina: true,
//         }}
//       />
//       <div className={styles.wrapper}>
//         <h1 className={styles.title}>Thanh toán đơn hàng</h1>
//         <div className={styles.checkout}>
//           <div className={styles.mainContent}>
//             <div className={`${styles.section} ${styles.fadeIn}`}>
//               <h2 className={styles.sectionTitle}>
//                 <span className={styles.titleIcon}>👤</span> Thông tin người
//                 nhận
//               </h2>
//               <div className={styles.userInfo}>
//                 <p>
//                   <UserOutlined className={styles.icon} />{" "}
//                   <strong>Họ tên:</strong> {user.username || "N/A"}
//                 </p>
//                 <p>
//                   <MailOutlined className={styles.icon} />{" "}
//                   <strong>Email:</strong> {user.email || "N/A"}
//                 </p>
//                 <p>
//                   <PhoneOutlined className={styles.icon} />{" "}
//                   <strong>Số điện thoại:</strong>{" "}
//                   {user.profile?.phoneNumber || "N/A"}
//                 </p>
//               </div>
//             </div>

//             <div className={`${styles.section} ${styles.fadeIn}`}>
//               <h2 className={styles.sectionTitle}>
//                 <span className={styles.titleIcon}>📍</span> Địa chỉ giao hàng
//               </h2>
//               {loadingAddresses ? (
//                 <Skeleton
//                   active
//                   paragraph={{ rows: 3 }}
//                   className={styles.skeleton}
//                 />
//               ) : addresses.length === 0 ? (
//                 <p className={styles.empty}>Chưa có địa chỉ nào được thêm</p>
//               ) : (
//                 <div className={styles.addressList}>
//                   {addresses.map((address) => (
//                     <div
//                       key={address.id}
//                       className={`${styles.addressItem} ${
//                         selectedAddress === address.id ? styles.selected : ""
//                       }`}
//                       onClick={() =>
//                         !loadingShipping[address.id] &&
//                         handleSelectAddress(address.id)
//                       }
//                     >
//                       <div className={styles.addressContent}>
//                         <p className={styles.addressText}>
//                           {address.street}, {address.city}, {address.country}
//                         </p>
//                       </div>
//                       {loadingShipping[address.id] ? (
//                         <Skeleton.Button active size="small" />
//                       ) : (
//                         <Radio
//                           checked={selectedAddress === address.id}
//                           className={styles.addressRadio}
//                         />
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//               <Button
//                 type="link"
//                 onClick={() => setIsModalVisible(true)}
//                 className={styles.addAddressBtn}
//                 icon={<PlusOutlined />}
//               >
//                 Thêm địa chỉ mới
//               </Button>
//             </div>

//             <Modal
//               title="Thêm địa chỉ mới"
//               open={isModalVisible}
//               onCancel={() => {
//                 setIsModalVisible(false);
//                 form.resetFields();
//               }}
//               footer={null}
//               className={styles.modal}
//             >
//               <Form form={form} onFinish={handleAddAddress} layout="vertical">
//                 <Form.Item
//                   name="street"
//                   label="Đường"
//                   rules={[
//                     { required: true, message: "Vui lòng nhập tên đường" },
//                   ]}
//                 >
//                   <Input placeholder="Nhập tên đường" />
//                 </Form.Item>
//                 <Form.Item
//                   name="city"
//                   label="Thành phố"
//                   rules={[
//                     { required: true, message: "Vui lòng nhập thành phố" },
//                   ]}
//                 >
//                   <Input placeholder="Nhập thành phố" />
//                 </Form.Item>
//                 <Form.Item
//                   name="country"
//                   label="Quốc gia"
//                   initialValue="VN"
//                   rules={[
//                     { required: true, message: "Vui lòng nhập quốc gia" },
//                   ]}
//                 >
//                   <Input placeholder="Nhập quốc gia" />
//                 </Form.Item>
//                 <Form.Item>
//                   <Button type="primary" htmlType="submit">
//                     Lưu địa chỉ
//                   </Button>
//                 </Form.Item>
//               </Form>
//             </Modal>

//             <div className={`${styles.section} ${styles.fadeIn}`}>
//               <h2 className={styles.sectionTitle}>
//                 <span className={styles.titleIcon}>🎟️</span> Mã giảm giá
//               </h2>
//               {loadingDiscounts ? (
//                 <Skeleton
//                   active
//                   paragraph={{ rows: 2 }}
//                   className={styles.skeleton}
//                 />
//               ) : availableDiscounts.length === 0 ? (
//                 <p className={styles.empty}>Không có mã giảm giá khả dụng</p>
//               ) : (
//                 <div className={styles.discountList}>
//                   {availableDiscounts.map((discount) => (
//                     <Tooltip
//                       key={discount.id}
//                       title={`Áp dụng cho ${discount.condition === "TOTAL" ? "tổng đơn" : "phí vận chuyển"}`}
//                     >
//                       <div
//                         className={`${styles.discountItem} ${styles.slideIn}`}
//                       >
//                         <Checkbox
//                           checked={
//                             selectedDiscounts[discount.condition]?.id ===
//                             discount.id
//                           }
//                           onChange={() => handleSelectDiscount(discount)}
//                           className={styles.discountCheckbox}
//                         />
//                         <p>
//                           Mã: <strong>{discount.name}</strong> - Giảm:{" "}
//                           {discount.discountType === "PERCENTAGE"
//                             ? `${discount.discountValue}%`
//                             : `${new Intl.NumberFormat("vi-VN").format(discount.discountValue)} đ`}{" "}
//                           (
//                           {discount.condition === "TOTAL"
//                             ? "Tổng đơn"
//                             : "Phí vận chuyển"}
//                           )
//                         </p>
//                       </div>
//                     </Tooltip>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className={`${styles.section} ${styles.fadeIn}`}>
//               <h2 className={styles.sectionTitle}>
//                 <span className={styles.titleIcon}>💳</span> Phương thức thanh
//                 toán
//               </h2>
//               <Radio.Group
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//                 value={paymentMethod}
//                 className={styles.paymentMethods}
//               >
//                 <div className={`${styles.paymentItem} ${styles.slideIn}`}>
//                   <Radio value="COD">
//                     Thanh toán khi nhận hàng (COD)
//                     <p className={styles.paymentDesc}>
//                       Thanh toán tiền mặt khi nhận hàng
//                     </p>
//                   </Radio>
//                 </div>
//                 <div className={`${styles.paymentItem} ${styles.slideIn}`}>
//                   <Radio value="VNPAY">
//                     Thanh toán qua VNPAY
//                     <p className={styles.paymentDesc}>
//                       Thanh toán an toàn qua cổng VNPAY
//                     </p>
//                   </Radio>
//                 </div>
//               </Radio.Group>
//             </div>

//             <div className={`${styles.section} ${styles.fadeIn}`}>
//               <h2 className={styles.sectionTitle}>
//                 <span className={styles.titleIcon}>🛒</span> Sản phẩm thanh toán
//               </h2>
//               <div className={styles.itemList}>
//                 {checkoutItems.map((item, index) => (
//                   <div
//                     key={index}
//                     className={`${styles.item} ${styles.slideIn}`}
//                   >
//                     <img
//                       src={item.image || placeholderImage}
//                       alt={item.productDetails.product.name}
//                       className={styles.itemImage}
//                       onError={(e) => {
//                         if (e.target.src !== placeholderImage) {
//                           e.target.src = placeholderImage;
//                         }
//                       }}
//                     />
//                     <div className={styles.itemDetails}>
//                       <h3 className={styles.itemName}>
//                         {item.productDetails.product.name}
//                       </h3>
//                       <p className={styles.itemVariant}>
//                         Màu sắc: {item.productDetails.color} | Kích thước:{" "}
//                         {item.productDetails.size}
//                       </p>
//                       <p className={styles.itemQuantity}>
//                         Số lượng: {item.quantity}
//                       </p>
//                       <p className={styles.itemPrice}>
//                         Giá: {new Intl.NumberFormat("vi-VN").format(item.price)}{" "}
//                         đ
//                       </p>
//                       <p className={styles.itemTotal}>
//                         Tổng:{" "}
//                         {new Intl.NumberFormat("vi-VN").format(item.totalPrice)}{" "}
//                         đ
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className={`${styles.summary} ${styles.fadeIn}`}>
//             <div className={styles.total}>
//               <div>
//                 <p>Tổng tiền hàng:</p>
//                 <p>Phí vận chuyển:</p>
//                 <p>Giảm giá sản phẩm:</p>
//                 <p>Giảm giá vận chuyển:</p>
//                 <p className={styles.totalLabel}>Tổng thanh toán:</p>
//               </div>
//               <div>
//                 <p>{new Intl.NumberFormat("vi-VN").format(totalAmount)} đ</p>
//                 <p>{new Intl.NumberFormat("vi-VN").format(shippingFee)} đ</p>
//                 <p className={styles.discount}>
//                   {new Intl.NumberFormat("vi-VN").format(productDiscount)} đ
//                 </p>
//                 <p className={styles.discount}>
//                   {new Intl.NumberFormat("vi-VN").format(shippingFreeDiscount)}{" "}
//                   đ
//                 </p>
//                 <p className={styles.totalAmount}>
//                   {new Intl.NumberFormat("vi-VN").format(finalTotal)} đ
//                 </p>
//               </div>
//             </div>

//             <div className={styles.actions}>
//               <Button
//                 type="primary"
//                 className={styles.confirmButton}
//                 onClick={handleConfirmCheckout}
//                 loading={isLoading}
//                 disabled={!selectedAddress}
//               >
//                 Xác nhận thanh toán
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default CheckoutPage;

import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Checkout.module.scss";
import Breadcrumb from "../../components/Breadcrumb";
import { getAddresses } from "../../services/api/userService";
import {
  calculateShipping,
  getAvailableDiscounts,
} from "../../services/api/cartService";
import {
  notification,
  Radio,
  Button,
  Modal,
  Form,
  Input,
  Checkbox,
  Skeleton,
  Tooltip,
} from "antd";
import { debounce } from "lodash";
import placeholderImage from "../../assets/images/daychuyen1/vyn13-t-1-1659674319051.webp";
import privateAxios from "../../services/api/privateAxios";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import Particles from "@tsparticles/react";
import { loadAll } from "@tsparticles/all";

const CheckoutPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const paymentData = state?.paymentData || {};
  const user = paymentData.usercheckout || {};
  const checkoutItems = paymentData.checkoutItems || [];
  const totalAmount = paymentData.totalAmount || 0;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditUserModalVisible, setIsEditUserModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editUserForm] = Form.useForm();
  const [shippingFee, setShippingFee] = useState(0);
  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState({
    TOTAL: null,
    SHIPPING: null,
  });
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingDiscounts, setLoadingDiscounts] = useState(true);
  const [loadingShipping, setLoadingShipping] = useState({});

  const particlesInit = async (engine) => {
    await loadAll(engine);
  };

  const breadcrumbItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Giỏ hàng", path: "/cart/gio-hang-cua-ban" },
    { label: "Thanh toán" },
  ];

  const calculateDiscountAmount = () => {
    let productDiscount = 0;
    let shippingFreeDiscount = 0;

    if (selectedDiscounts.TOTAL) {
      const discount = selectedDiscounts.TOTAL;
      if (discount.discountType === "PERCENTAGE") {
        productDiscount += Math.round(
          (totalAmount * parseFloat(discount.discountValue)) / 100,
        );
      } else if (discount.discountType === "FIXED") {
        productDiscount += parseFloat(discount.discountValue);
      }
    }

    if (selectedDiscounts.SHIPPING) {
      const discount = selectedDiscounts.SHIPPING;
      let calculatedDiscount = 0;
      if (discount.discountType === "PERCENTAGE") {
        calculatedDiscount = Math.round(
          (shippingFee * parseFloat(discount.discountValue)) / 100,
        );
      } else if (discount.discountType === "FIXED") {
        calculatedDiscount = parseFloat(discount.discountValue);
      }
      shippingFreeDiscount = Math.min(calculatedDiscount, shippingFee);
    }

    return { productDiscount, shippingFreeDiscount };
  };

  const { productDiscount, shippingFreeDiscount } = calculateDiscountAmount();
  const finalTotal =
    totalAmount + shippingFee - (productDiscount + shippingFreeDiscount);

  useEffect(() => {
    const fetchAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const response = await getAddresses();
        setAddresses(response || []);
        setShippingFee(0);
      } catch (error) {
        notification.error({
          message: "Thông báo",
          description: "Không thể tải danh sách địa chỉ, vui lòng thử lại",
          duration: 3,
        });
        setShippingFee(0);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, []);

  const fetchAvailableDiscounts = useCallback(
    debounce(async () => {
      setLoadingDiscounts(true);
      try {
        const response = await getAvailableDiscounts({
          totalAmount,
          shippingFee,
        });
        setAvailableDiscounts(response || []);
        if (!response || response.length === 0) {
          setSelectedDiscounts({ TOTAL: null, SHIPPING: null });
        }
      } catch (error) {
        notification.error({
          message: "Thông báo",
          description: "Không thể lấy danh sách mã giảm giá, vui lòng thử lại",
          duration: 3,
        });
        setAvailableDiscounts([]);
        setSelectedDiscounts({ TOTAL: null, SHIPPING: null });
      } finally {
        setLoadingDiscounts(false);
      }
    }, 500),
    [totalAmount, shippingFee],
  );

  useEffect(() => {
    if (totalAmount > 0) {
      fetchAvailableDiscounts();
    } else {
      setAvailableDiscounts([]);
      setSelectedDiscounts({ TOTAL: null, SHIPPING: null });
      setLoadingDiscounts(false);
    }
  }, [totalAmount, shippingFee, fetchAvailableDiscounts]);

  const handleSelectDiscount = (discount) => {
    const condition = discount.condition;
    setSelectedDiscounts((prev) => {
      if (prev[condition]?.id === discount.id) {
        return { ...prev, [condition]: null };
      } else {
        return { ...prev, [condition]: discount };
      }
    });
  };

  const handleSelectAddress = async (addressId) => {
    setSelectedAddress(addressId);
    setLoadingShipping((prev) => ({ ...prev, [addressId]: true }));
    const address = addresses.find((addr) => addr.id === addressId);
    if (address && checkoutItems?.length > 0) {
      if (
        address.street &&
        address.city &&
        address.country &&
        checkoutItems.every((item) => item.productDetails?.id)
      ) {
        try {
          const response = await calculateShipping({
            checkoutItems: checkoutItems.map((item) => ({
              productDetailId: item.productDetails.id,
              quantity: item.quantity,
            })),
            totalAmount,
            address: {
              street: address.street,
              city: address.city,
              country: address.country,
            },
          });
          setShippingFee(response.shippingFee || 0);
          notification.success({
            message: "Thông báo",
            description: "Đã tính phí vận chuyển thành công",
            duration: 2,
          });
        } catch (error) {
          notification.error({
            message: "Thông báo",
            description: "Không thể tính phí vận chuyển, vui lòng thử lại",
            duration: 3,
          });
          setShippingFee(0);
        } finally {
          setLoadingShipping((prev) => ({ ...prev, [addressId]: false }));
        }
      } else {
        setShippingFee(0);
        setLoadingShipping((prev) => ({ ...prev, [addressId]: false }));
      }
    } else {
      setShippingFee(0);
      setLoadingShipping((prev) => ({ ...prev, [addressId]: false }));
    }
  };

  const handleAddAddress = async (values) => {
    try {
      const newAddress = {
        id: `temp-${Date.now()}`,
        street: values.street,
        city: values.city,
        country: values.country,
      };
      setAddresses([...addresses, newAddress]);
      setSelectedAddress(newAddress.id);
      if (checkoutItems?.length > 0) {
        try {
          const response = await calculateShipping({
            checkoutItems: checkoutItems.map((item) => ({
              productDetailId: item.productDetails.id,
              quantity: item.quantity,
            })),
            totalAmount,
            address: {
              street: newAddress.street,
              city: newAddress.city,
              country: newAddress.country,
            },
          });
          setShippingFee(response.shippingFee || 0);
        } catch (error) {
          notification.error({
            message: "Thông báo",
            description: "Không thể tính phí vận chuyển, vui lòng thử lại",
            duration: 3,
          });
          setShippingFee(0);
        }
      } else {
        setShippingFee(0);
      }
      setIsModalVisible(false);
      form.resetFields();
      notification.success({
        message: "Thông báo",
        description: "Thêm địa chỉ thành công",
        duration: 3,
      });
    } catch (error) {
      notification.error({
        message: "Thông báo",
        description: "Thêm địa chỉ thất bại, vui lòng thử lại",
        duration: 3,
      });
    }
  };

  const handleEditUser = async (values) => {
    try {
      // Giả lập cập nhật thông tin user (cần API thực tế)
      user.username = values.username || user.username;
      user.email = values.email || user.email;
      user.profile.phoneNumber = values.phoneNumber || user.profile.phoneNumber;
      setIsEditUserModalVisible(false);
      editUserForm.resetFields();
      notification.success({
        message: "Thông báo",
        description: "Cập nhật thông tin thành công",
        duration: 3,
      });
    } catch (error) {
      notification.error({
        message: "Thông báo",
        description: "Cập nhật thông tin thất bại, vui lòng thử lại",
        duration: 3,
      });
    }
  };

  const handleConfirmCheckout = async () => {
    if (!selectedAddress) {
      notification.error({
        message: "Thông báo",
        description: "Vui lòng chọn hoặc thêm một địa chỉ giao hàng",
        duration: 3,
      });
      return;
    }

    setIsLoading(true);
    try {
      const address = addresses.find((addr) => addr.id === selectedAddress);
      if (!address) {
        notification.error({
          message: "Thông báo",
          description: "Địa chỉ không hợp lệ, vui lòng thử lại",
          duration: 3,
        });
        setIsLoading(false);
        return;
      }

      const addressData = String(address.id).startsWith("temp-")
        ? {
            street: address.street,
            city: address.city,
            country: address.country,
          }
        : {
            id: address.id,
            street: address.street,
            city: address.city,
            country: address.country,
          };

      const validatedProductDiscount = selectedDiscounts.TOTAL
        ? productDiscount
        : 0;
      const validatedShippingFeeDiscount = selectedDiscounts.SHIPPING
        ? Math.max(0, Math.round(shippingFreeDiscount))
        : 0;

      const discountIds = [];
      if (selectedDiscounts.TOTAL) {
        discountIds.push(selectedDiscounts.TOTAL.id);
      }
      if (selectedDiscounts.SHIPPING) {
        discountIds.push(selectedDiscounts.SHIPPING.id);
      }

      const payload = {
        userId: user.id,
        productDetails: checkoutItems.map((item) => ({
          productDetailId: item.productDetails.id,
          quantity: item.quantity,
        })),
        address: addressData,
        paymentMethod,
        totalProductAmount: totalAmount,
        shippingFee,
        shippingFeeDiscount: validatedShippingFeeDiscount,
        productDiscount: validatedProductDiscount,
        finalTotal:
          totalAmount +
          shippingFee -
          (validatedProductDiscount + validatedShippingFeeDiscount),
        discountIds,
      };

      const response = await privateAxios.post("/v1/payment/checkout", payload);

      if (paymentMethod === "VNPAY" && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        notification.success({
          message: "Thông báo",
          description: response.data.message || "Xác nhận đơn hàng thành công",
          duration: 3,
        });
        navigate("/account/orders/invoice-detail");
      }
    } catch (error) {
      notification.error({
        message: "Thông báo",
        description:
          error.response?.data?.message ||
          "Xác nhận thanh toán thất bại, vui lòng thử lại",
        duration: 3,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 120,
          particles: {
            number: {
              value: window.innerWidth < 768 ? 20 : 50,
              density: {
                enable: true,
                area: 800,
              },
            },
            color: {
              value: "#d4af37",
            },
            shape: {
              type: "circle",
            },
            opacity: {
              value: { min: 0.3, max: 0.7 },
              random: true,
            },
            size: {
              value: { min: 1, max: 3 },
              random: true,
            },
            move: {
              enable: true,
              speed: { min: 0.5, max: 1 },
              direction: "none",
              random: false,
              straight: false,
              outModes: "out",
              bounce: false,
            },
          },
          detectRetina: true,
        }}
      />
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Thanh Toán Đơn Hàng</h1>
        <div className={styles.checkout}>
          <div className={styles.mainContent}>
            <div className={`${styles.section} ${styles.fadeIn}`}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleIcon}>👤</span> Thông Tin Người
                Nhận
              </h2>
              <div className={styles.userInfo}>
                <p>
                  <UserOutlined className={styles.icon} />{" "}
                  <strong>Họ tên:</strong> {user.username || "N/A"}
                </p>
                <p>
                  <MailOutlined className={styles.icon} />{" "}
                  <strong>Email:</strong> {user.email || "N/A"}
                </p>
                <p>
                  <PhoneOutlined className={styles.icon} />{" "}
                  <strong>Số điện thoại:</strong>{" "}
                  {user.profile?.phoneNumber || "N/A"}
                </p>
              </div>
            </div>

            <Modal
              title="Chỉnh Sửa Thông Tin Người Nhận"
              open={isEditUserModalVisible}
              onCancel={() => {
                setIsEditUserModalVisible(false);
                editUserForm.resetFields();
              }}
              footer={null}
              className={styles.modal}
            >
              <Form
                form={editUserForm}
                onFinish={handleEditUser}
                layout="vertical"
                initialValues={{
                  username: user.username,
                  email: user.email,
                  phoneNumber: user.profile?.phoneNumber,
                }}
              >
                <Form.Item
                  name="username"
                  label="Họ tên"
                  rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                >
                  <Input placeholder="Nhập họ tên" />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input placeholder="Nhập email" />
                </Form.Item>
                <Form.Item
                  name="phoneNumber"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                  ]}
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Lưu thông tin
                  </Button>
                </Form.Item>
              </Form>
            </Modal>

            <div className={`${styles.section} ${styles.fadeIn}`}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleIcon}>📍</span> Địa Chỉ Giao Hàng
              </h2>
              {loadingAddresses ? (
                <Skeleton
                  active
                  paragraph={{ rows: 3 }}
                  className={styles.skeleton}
                />
              ) : addresses.length === 0 ? (
                <p className={styles.empty}>Chưa có địa chỉ nào được thêm</p>
              ) : (
                <div className={styles.addressList}>
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`${styles.addressItem} ${
                        selectedAddress === address.id ? styles.selected : ""
                      }`}
                      onClick={() =>
                        !loadingShipping[address.id] &&
                        handleSelectAddress(address.id)
                      }
                    >
                      <div className={styles.addressContent}>
                        <p className={styles.addressText}>
                          {address.street}, {address.city}, {address.country}
                        </p>
                      </div>
                      {loadingShipping[address.id] ? (
                        <Skeleton.Button active size="small" />
                      ) : (
                        <Radio
                          checked={selectedAddress === address.id}
                          className={styles.addressRadio}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="link"
                onClick={() => setIsModalVisible(true)}
                className={styles.addAddressBtn}
                icon={<PlusOutlined />}
              >
                Thêm địa chỉ mới
              </Button>
            </div>

            <Modal
              title="Thêm Địa Chỉ Mới"
              open={isModalVisible}
              onCancel={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}
              footer={null}
              className={styles.modal}
            >
              <Form form={form} onFinish={handleAddAddress} layout="vertical">
                <Form.Item
                  name="street"
                  label="Đường"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên đường" },
                  ]}
                >
                  <Input placeholder="Nhập tên đường" />
                </Form.Item>
                <Form.Item
                  name="city"
                  label="Thành phố"
                  rules={[
                    { required: true, message: "Vui lòng nhập thành phố" },
                  ]}
                >
                  <Input placeholder="Nhập thành phố" />
                </Form.Item>
                <Form.Item
                  name="country"
                  label="Quốc gia"
                  initialValue="VN"
                  rules={[
                    { required: true, message: "Vui lòng nhập quốc gia" },
                  ]}
                >
                  <Input placeholder="Nhập quốc gia" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Lưu địa chỉ
                  </Button>
                </Form.Item>
              </Form>
            </Modal>

            <div className={`${styles.section} ${styles.fadeIn}`}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleIcon}>🎟️</span> Mã Giảm Giá
              </h2>
              {loadingDiscounts ? (
                <Skeleton
                  active
                  paragraph={{ rows: 2 }}
                  className={styles.skeleton}
                />
              ) : availableDiscounts.length === 0 ? (
                <p className={styles.empty}>Không có mã giảm giá khả dụng</p>
              ) : (
                <div className={styles.discountList}>
                  {availableDiscounts.map((discount) => (
                    <Tooltip
                      key={discount.id}
                      title={`Áp dụng cho ${discount.condition === "TOTAL" ? "tổng đơn hàng" : "phí vận chuyển"}.`}
                    >
                      <div
                        className={`${styles.discountItem} ${styles.slideIn}`}
                      >
                        <Checkbox
                          checked={
                            selectedDiscounts[discount.condition]?.id ===
                            discount.id
                          }
                          onChange={() => handleSelectDiscount(discount)}
                          className={styles.discountCheckbox}
                        />
                        <p>
                          Mã: <strong>{discount.name}</strong> - Giảm:{" "}
                          {discount.discountType === "PERCENTAGE"
                            ? `${discount.discountValue}%`
                            : `${new Intl.NumberFormat("vi-VN").format(discount.discountValue)} đ`}{" "}
                          (
                          {discount.condition === "TOTAL"
                            ? "Tổng đơn hàng"
                            : "Phí vận chuyển"}
                          )
                        </p>
                        <InfoCircleOutlined className={styles.infoIcon} />
                      </div>
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>

            <div className={`${styles.section} ${styles.fadeIn}`}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleIcon}>💳</span> Phương Thức Thanh
                Toán
              </h2>
              <Radio.Group
                onChange={(e) => setPaymentMethod(e.target.value)}
                value={paymentMethod}
                className={styles.paymentMethods}
              >
                <div className={`${styles.paymentItem} ${styles.slideIn}`}>
                  <Radio value="COD">
                    Thanh toán khi nhận hàng (COD)
                    <p className={styles.paymentDesc}>
                      Thanh toán tiền mặt khi nhận hàng
                    </p>
                  </Radio>
                </div>
                <div className={`${styles.paymentItem} ${styles.slideIn}`}>
                  <Radio value="VNPAY">
                    Thanh toán qua VNPAY
                    <p className={styles.paymentDesc}>
                      Thanh toán an toàn qua cổng VNPAY
                    </p>
                  </Radio>
                </div>
              </Radio.Group>
            </div>

            <div className={`${styles.section} ${styles.fadeIn}`}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleIcon}>🛒</span> Sản Phẩm Thanh Toán
              </h2>
              <div className={styles.itemList}>
                {checkoutItems.map((item, index) => (
                  <div
                    key={index}
                    className={`${styles.item} ${styles.slideIn}`}
                  >
                    <img
                      src={item.image || placeholderImage}
                      alt={item.productDetails.product.name}
                      className={styles.itemImage}
                      onError={(e) => {
                        if (e.target.src !== placeholderImage) {
                          e.target.src = placeholderImage;
                        }
                      }}
                    />
                    <div className={styles.itemDetails}>
                      <h3 className={styles.itemName}>
                        {item.productDetails.product.name}
                      </h3>
                      <p className={styles.itemVariant}>
                        Màu sắc: {item.productDetails.color} | Kích thước:{" "}
                        {item.productDetails.size}
                      </p>
                      <p className={styles.itemQuantity}>
                        Số lượng: {item.quantity}
                      </p>
                      <p className={styles.itemPrice}>
                        Giá: {new Intl.NumberFormat("vi-VN").format(item.price)}{" "}
                        đ
                      </p>
                      <p className={styles.itemTotal}>
                        Tổng:{" "}
                        {new Intl.NumberFormat("vi-VN").format(item.totalPrice)}{" "}
                        đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`${styles.summary} ${styles.fadeIn}`}>
            <div className={styles.total}>
              <div>
                <p>Tổng tiền hàng:</p>
                <p>
                  <span style={{ marginRight: "-10px" }}>Phí vận chuyển</span>{" "}
                  <Tooltip title="Phí vận chuyển được tính dựa trên địa chỉ giao hàng và tổng trọng lượng đơn hàng">
                    <InfoCircleOutlined className={styles.infoIcon} />
                  </Tooltip>
                  :
                </p>
                <p>Giảm giá sản phẩm:</p>
                <p>Giảm giá vận chuyển:</p>
                <p className={styles.totalLabel}>Tổng thanh toán:</p>
              </div>
              <div>
                <p>{new Intl.NumberFormat("vi-VN").format(totalAmount)} đ</p>
                <p>{new Intl.NumberFormat("vi-VN").format(shippingFee)} đ</p>
                <p className={styles.discount}>
                  {new Intl.NumberFormat("vi-VN").format(productDiscount)} đ
                </p>
                <p className={styles.discount}>
                  {new Intl.NumberFormat("vi-VN").format(shippingFreeDiscount)}{" "}
                  đ
                </p>
                <p className={styles.totalAmount}>
                  {new Intl.NumberFormat("vi-VN").format(finalTotal)} đ
                </p>
              </div>
            </div>

            <div className={styles.actions}>
              <div
                className={styles.confirmButton}
                onClick={handleConfirmCheckout}
                loading={isLoading}
                disabled={!selectedAddress}
              >
                Xác Nhận Thanh Toán
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
