// import React, { useState, useEffect } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import styles from "./Checkout.module.scss";
// import { PaymentVNPAY } from "../../services/api/checkoutService";

// const Checkout = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { cartItems, emailtoken, paymentData } = location.state || {};
//   const paymentDataArray = Object.values(paymentData);
//   const [shippingInfo, setShippingInfo] = useState({
//     email: emailtoken || "",
//     name: "",
//     phone: "",
//     streetNumber: "",
//     province: "",
//     note: "",
//   });

//   const [showFundiinDetails, setShowFundiinDetails] = useState(false);

//   const [showVNPayDetails, setShowVNPayDetails] = useState(false);

//   const [showBankDetails, setShowBankDetails] = useState(false);

//   const [showCODDetails, setShowCODDetails] = useState(false);

//   useEffect(() => {
//     const email = localStorage.getItem("userEmail");
//     if (email) {
//       setShippingInfo((prev) => ({
//         ...prev,
//         email: email,
//       }));
//     }
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setShippingInfo((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };
//   const data = paymentDataArray[2];
//   const addresses = data?.user?.user_profile?.profile_addresses || [];

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/");
//   };

//   const [paymentMethod, setPaymentMethod] = useState("VNPAY");
//   const [addressId, setAddressId] = useState(addresses[0]?._id || null);

//   const discount_id = localStorage.getItem("discount_id");
//   const handlePayment = async () => {
//     try {
//       const email = localStorage.getItem("userEmail");
//       const items = cartItems.map((item) => ({
//         product_id: item?.id,
//         quantity: item.quantity,
//       }));
//       let response;
//       const payload = {
//         email,
//         addressId,
//         paymentMethod,
//         items,
//         totalAmount: data?.totalAmountAfterDiscount,
//       };

//       if (
//         discount_id !== null &&
//         discount_id !== undefined &&
//         discount_id !== "null"
//       ) {
//         payload.discount_id = discount_id;
//       }

//       response = await PaymentVNPAY(payload);

//       if (paymentMethod === "VNPAY") {
//         window.location.href = response.data.vnpayResponse;
//       } else if (paymentMethod === "COD") {
//         navigate("/payment-success");
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   };
//   return (
//     <div className={styles.checkoutContainer}>
//       <div className={styles.logo}>
//         <img
//           src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/logo.png"
//           alt="Caraluna"
//         />
//       </div>

//       <div className={styles.checkoutContent}>
//         <div className={styles.checkoutForm}>
//           <div className={styles.leftSection}>
//             <div className={styles.headerSection}>
//               <h2>Thông tin mua hàng</h2>
//               <button onClick={handleLogout} className={styles.loginLink}>
//                 Đăng xuất
//               </button>
//             </div>

//             <form className={styles.shippingForm}>
//               <div>
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Email"
//                   value={shippingInfo.email}
//                   onChange={handleInputChange}
//                 />
//                 <input
//                   type="text"
//                   name="name"
//                   placeholder="Họ và tên"
//                   value={
//                     data?.user?.user_profile?.firstName +
//                     " " +
//                     data?.user?.user_profile?.lastName
//                   }
//                   onChange={handleInputChange}
//                 />
//                 <input
//                   type="tel"
//                   name="phone"
//                   placeholder="Số điện thoại"
//                   value={data?.user?.user_profile?.phoneNumber}
//                   onChange={handleInputChange}
//                 />
//                 <select
//                   name="streetNumber"
//                   value={shippingInfo.streetNumber}
//                   onChange={(e) => {
//                     handleInputChange(e);
//                     const selectedIndex = e.target.selectedIndex;
//                     const selectedAddressId = addresses[selectedIndex]?._id;
//                     setAddressId(selectedAddressId);
//                   }}
//                 >
//                   {addresses.map((address, index) => (
//                     <option
//                       key={index}
//                       value={`${address.addressLine}, ${address.district}, ${address.city}, ${address.country}`}
//                     >
//                       {`${address.addressLine}, ${address.district}, ${address.city}, ${address.country}`}
//                     </option>
//                   ))}
//                 </select>
//                 <textarea
//                   name="note"
//                   placeholder="Ghi chú (tùy chọn)"
//                   value={shippingInfo.note}
//                   onChange={handleInputChange}
//                 />
//               </div>
//             </form>
//           </div>

//           <div className={styles.rightSection}>
//             <div className={styles.paymentSection}>
//               <h3>Thanh toán</h3>
//               <div className={styles.paymentOptions}>
//                 <div className={styles.paymentOption}>
//                   <input
//                     type="radio"
//                     name="payment"
//                     value="VNPAY"
//                     checked={paymentMethod === "VNPAY"}
//                     onChange={(e) => {
//                       setPaymentMethod(e.target.value);
//                       setShowVNPayDetails(true);
//                       setShowFundiinDetails(false);
//                     }}
//                   />
//                   <span>Thanh toán qua VNPAY</span>
//                   <img
//                     style={{
//                       width: "52px",
//                       height: "28px",
//                       objectFit: "contain",
//                     }}
//                     src="https://ruouthuduc.vn/wp-content/uploads/2023/11/Logo-VNPAY-QR.webp"
//                     alt="VNPAY"
//                   />
//                 </div>

//                 {showVNPayDetails && paymentMethod === "VNPAY" && (
//                   <div className={styles.vnpayDetails}>
//                     <p>Thanh toán VNPAY</p>
//                   </div>
//                 )}
//                 <div className={styles.paymentOption}>
//                   <input
//                     type="radio"
//                     name="payment"
//                     value="COD"
//                     checked={paymentMethod === "COD"}
//                     onChange={(e) => {
//                       setPaymentMethod(e.target.value);
//                       setShowCODDetails(true);
//                       setShowBankDetails(false);
//                       setShowVNPayDetails(false);
//                       setShowFundiinDetails(false);
//                     }}
//                   />
//                   <span>Thanh toán khi giao hàng (COD)</span>
//                   <img
//                     style={{
//                       width: "52px",
//                       height: "28px",
//                       objectFit: "contain",
//                     }}
//                     src="https://cdn-icons-png.freepik.com/512/8992/8992633.png"
//                     alt="COD"
//                   />
//                 </div>

//                 {showCODDetails && paymentMethod === "COD" && (
//                   <div className={styles.codDetails}>
//                     <p>
//                       Bạn có thể nhận hàng và kiểm tra hàng rồi thanh toán 100%
//                       giá trị đơn hàng cho đơn vị vận chuyển.
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className={styles.orderSummary}>
//           <h3>Đơn hàng ({cartItems?.length || 0} sản phẩm)</h3>
//           {cartItems?.map((item) => (
//             <div key={item.id} className={styles.productItem}>
//               <img
//                 src={item.product.product_details.product_images[0].secure_url}
//                 alt={item.product.product_name}
//               />
//               <div className={styles.productInfo}>
//                 <p>{item.product.product_name}</p>
//                 <span>{item.product.product_details.color}</span>
//               </div>
//               <div className={styles.productPrice}>
//                 {new Intl.NumberFormat("vi-VN").format(
//                   item.product.product_sale_price || item.product.product_price,
//                 )}
//                 đ
//               </div>
//             </div>
//           ))}

//           {/* <div className={styles.couponSection}>
//             <input type="text" placeholder="Nhập mã giảm giá" />
//             <button>Áp dụng</button>
//           </div> */}

//           <div className={styles.orderTotal}>
//             <div className={styles.subtotal}>
//               <span>Tạm tính</span>
//               {new Intl.NumberFormat("vi-VN").format(
//                 data?.totalAmountBeforeDiscount,
//               )}
//               đ
//             </div>
//             <div className={styles.shipping}>
//               <span>Phí vận chuyển</span>
//               <span>Miễn phí</span>
//             </div>

//             <div className={styles.total}>
//               <div>
//                 <span style={{ marginRight: "214px" }}>Số tiền đã giảm:</span>
//                 {new Intl.NumberFormat("vi-VN").format(data?.discountApplied)}đ
//               </div>
//               <div>
//                 <span style={{ marginRight: "250px" }}>Tổng cộng: </span>
//                 {new Intl.NumberFormat("vi-VN").format(
//                   data?.totalAmountAfterDiscount,
//                 )}
//                 đ
//               </div>
//             </div>
//           </div>

//           <div className={styles.actionButtons}>
//             <Link to="/cart/gio-hang-cua-ban" className={styles.backToCart}>
//               Quay về giỏ hàng
//             </Link>
//             <button onClick={handlePayment} className={styles.orderButton}>
//               ĐẶT HÀNG
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Checkout;

// import React, { useState, useEffect } from "react";
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
// } from "antd";
// import placeholderImage from "../../assets/images/daychuyen1/vyn13-t-1-1659674319051.webp";

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

//   const breadcrumbItems = [
//     { label: "Trang chủ", path: "/" },
//     { label: "Giỏ hàng", path: "/cart/gio-hang-cua-ban" },
//     { label: "Thanh toán" },
//   ];

//   // Tính giá trị giảm giá
//   const calculateDiscountAmount = () => {
//     let discountAmount = 0;
//     if (selectedDiscounts.TOTAL) {
//       const discount = selectedDiscounts.TOTAL;
//       if (discount.discountType === "PERCENTAGE") {
//         discountAmount +=
//           (totalAmount * parseFloat(discount.discountValue)) / 100;
//       } else if (discount.discountType === "FIXED") {
//         discountAmount += parseFloat(discount.discountValue);
//       }
//     }
//     if (selectedDiscounts.SHIPPING) {
//       const discount = selectedDiscounts.SHIPPING;
//       if (discount.discountType === "PERCENTAGE") {
//         discountAmount +=
//           (shippingFee * parseFloat(discount.discountValue)) / 100;
//       } else if (discount.discountType === "FIXED") {
//         discountAmount += parseFloat(discount.discountValue);
//       }
//     }
//     return discountAmount;
//   };

//   // Tổng thanh toán sau giảm giá
//   const finalTotal = totalAmount + shippingFee - calculateDiscountAmount();

//   // Lấy danh sách địa chỉ
//   useEffect(() => {
//     const fetchAddresses = async () => {
//       try {
//         const response = await getAddresses();
//         console.log("Địa chỉ nhận được:", response);
//         setAddresses(response || []);
//         // Không tự động chọn địa chỉ hoặc gọi calculateShipping
//         setShippingFee(0); // Mặc định shippingFee = 0 khi chưa chọn địa chỉ
//       } catch (error) {
//         console.error("Lỗi khi lấy địa chỉ:", error);
//         notification.error({
//           message: "Thông báo",
//           description: "Không thể tải danh sách địa chỉ, vui lòng thử lại",
//           duration: 3,
//         });
//         setShippingFee(0);
//       }
//     };
//     fetchAddresses();
//   }, []);

//   // Gọi API lấy mã giảm giá
//   useEffect(() => {
//     const fetchAvailableDiscounts = async () => {
//       try {
//         console.log("Gọi getAvailableDiscounts với:", {
//           totalAmount,
//           shippingFee,
//         });
//         const response = await getAvailableDiscounts({
//           totalAmount,
//           shippingFee,
//         });
//         console.log("Mã giảm giá nhận được:", response);
//         setAvailableDiscounts(response || []);
//       } catch (error) {
//         console.error("Lỗi khi lấy mã giảm giá:", error);
//         notification.error({
//           message: "Thông báo",
//           description: "Không thể lấy danh sách mã giảm giá, vui lòng thử lại",
//           duration: 3,
//         });
//         setAvailableDiscounts([]);
//       }
//     };
//     if (totalAmount > 0) {
//       fetchAvailableDiscounts();
//     } else {
//       console.warn("totalAmount không hợp lệ, không gọi getAvailableDiscounts");
//       setAvailableDiscounts([]);
//     }
//   }, [totalAmount, shippingFee]);

//   // Xử lý chọn/hủy chọn mã giảm giá
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

//   // Xử lý chọn địa chỉ
//   const handleSelectAddress = async (addressId) => {
//     setSelectedAddress(addressId);
//     const address = addresses.find((addr) => addr.id === addressId);
//     if (address && checkoutItems?.length > 0) {
//       if (
//         address.street &&
//         address.city &&
//         address.country &&
//         checkoutItems.every((item) => item.productDetails?.id)
//       ) {
//         console.log("Gọi calculateShipping khi chọn địa chỉ:", address);
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
//           console.log("Phí vận chuyển nhận được:", response);
//           setShippingFee(response.shippingFee || 0);
//         } catch (error) {
//           console.error("Lỗi khi tính phí vận chuyển:", error);
//           notification.error({
//             message: "Thông báo",
//             description: "Không thể tính phí vận chuyển, vui lòng thử lại",
//             duration: 3,
//           });
//           setShippingFee(0);
//         }
//       } else {
//         console.warn("Dữ liệu không đủ để tính phí vận chuyển:", {
//           address,
//           checkoutItems,
//         });
//         setShippingFee(0);
//       }
//     } else {
//       console.warn("Không có địa chỉ hoặc sản phẩm để tính phí vận chuyển");
//       setShippingFee(0);
//     }
//   };

//   // Xử lý thêm địa chỉ mới
//   const handleAddAddress = async (values) => {
//     try {
//       const newAddress = {
//         id: `temp-${Date.now()}`,
//         street: values.street,
//         city: values.city,
//         country: values.country,
//       };
//       setAddresses([...addresses, newAddress]);
//       setSelectedAddress(newAddress.id); // Tự động chọn địa chỉ mới
//       if (checkoutItems?.length > 0) {
//         console.log("Gọi calculateShipping cho địa chỉ mới:", newAddress);
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
//           console.log("Phí vận chuyển nhận được:", response);
//           setShippingFee(response.shippingFee || 0);
//         } catch (error) {
//           console.error("Lỗi khi tính phí vận chuyển:", error);
//           notification.error({
//             message: "Thông báo",
//             description: "Không thể tính phí vận chuyển, vui lòng thử lại",
//             duration: 3,
//           });
//           setShippingFee(0);
//         }
//       } else {
//         console.warn("Không có sản phẩm để tính phí vận chuyển");
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
//       console.error("Lỗi khi thêm địa chỉ:", error);
//       notification.error({
//         message: "Thông báo",
//         description: "Thêm địa chỉ thất bại, vui lòng thử lại",
//         duration: 3,
//       });
//     }
//   };

//   // Xử lý xác nhận thanh toán
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
//       const addressData = address.id.startsWith("temp-")
//         ? {
//             street: address.street,
//             city: address.city,
//             country: address.country,
//           }
//         : { addressId: address.id };

//       const selectedDiscountsList =
//         Object.values(selectedDiscounts).filter(Boolean);

//       console.log({
//         userId: user.id,
//         address: addressData,
//         paymentMethod,
//         items: checkoutItems.map((item) => ({
//           productDetailsId: item.productDetails.id,
//           quantity: item.quantity,
//         })),
//         totalAmount: finalTotal,
//         discounts: selectedDiscountsList,
//       });
//       notification.success({
//         message: "Thông báo",
//         description: "Xác nhận đơn hàng thành công",
//         duration: 3,
//       });
//       navigate("/order-success");
//     } catch (error) {
//       console.error("Lỗi khi xác nhận thanh toán:", error);
//       notification.error({
//         message: "Thông báo",
//         description: "Xác nhận thanh toán thất bại, vui lòng thử lại",
//         duration: 3,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       <Breadcrumb items={breadcrumbItems} />
//       <div className={styles.wrapper}>
//         <h1 className={styles.title}>Thanh toán đơn hàng</h1>
//         <div className={styles.checkout}>
//           {/* Thông tin người dùng */}
//           <div className={styles.section}>
//             <h2 className={styles.sectionTitle}>Thông tin người nhận</h2>
//             <div className={styles.userInfo}>
//               <p>
//                 <strong>Họ tên:</strong> {user.username || "N/A"}
//               </p>
//               <p>
//                 <strong>Email:</strong> {user.email || "N/A"}
//               </p>
//               <p>
//                 <strong>Số điện thoại:</strong>{" "}
//                 {user.profile?.phoneNumber || "N/A"}
//               </p>
//             </div>
//           </div>

//           {/* Địa chỉ giao hàng */}
//           <div className={styles.section}>
//             <h2 className={styles.sectionTitle}>Địa chỉ giao hàng</h2>
//             {addresses.length === 0 ? (
//               <p className={styles.empty}>Chưa có địa chỉ nào được thêm</p>
//             ) : (
//               <div className={styles.addressList}>
//                 {addresses.map((address) => (
//                   <div
//                     key={address.id}
//                     className={`${styles.addressItem} ${
//                       selectedAddress === address.id ? styles.selected : ""
//                     }`}
//                     onClick={() => handleSelectAddress(address.id)}
//                   >
//                     <div className={styles.addressContent}>
//                       <p className={styles.addressText}>
//                         {address.street}, {address.city}, {address.country}
//                       </p>
//                     </div>
//                     <Radio
//                       checked={selectedAddress === address.id}
//                       className={styles.addressRadio}
//                     />
//                   </div>
//                 ))}
//               </div>
//             )}
//             <Button
//               type="link"
//               onClick={() => setIsModalVisible(true)}
//               className={styles.addAddressBtn}
//             >
//               Thêm địa chỉ mới
//             </Button>
//           </div>

//           {/* Modal thêm địa chỉ */}
//           <Modal
//             title="Thêm địa chỉ mới"
//             open={isModalVisible}
//             onCancel={() => {
//               setIsModalVisible(false);
//               form.resetFields();
//             }}
//             footer={null}
//           >
//             <Form form={form} onFinish={handleAddAddress} layout="vertical">
//               <Form.Item
//                 name="street"
//                 label="Đường"
//                 rules={[{ required: true, message: "Vui lòng nhập tên đường" }]}
//               >
//                 <Input placeholder="Nhập tên đường" />
//               </Form.Item>
//               <Form.Item
//                 name="city"
//                 label="Thành phố"
//                 rules={[{ required: true, message: "Vui lòng nhập thành phố" }]}
//               >
//                 <Input placeholder="Nhập thành phố" />
//               </Form.Item>
//               <Form.Item
//                 name="country"
//                 label="Quốc gia"
//                 initialValue="VN"
//                 rules={[{ required: true, message: "Vui lòng nhập quốc gia" }]}
//               >
//                 <Input placeholder="Nhập quốc gia" />
//               </Form.Item>
//               <Form.Item>
//                 <Button type="primary" htmlType="submit">
//                   Lưu địa chỉ
//                 </Button>
//               </Form.Item>
//             </Form>
//           </Modal>

//           {/* Mã giảm giá */}
//           <div className={styles.section}>
//             <h2 className={styles.sectionTitle}>Mã giảm giá</h2>
//             {availableDiscounts.length === 0 ? (
//               <p className={styles.empty}>Không có mã giảm giá khả dụng</p>
//             ) : (
//               <div className={styles.discountList}>
//                 {availableDiscounts.map((discount) => (
//                   <div key={discount.id} className={styles.discountItem}>
//                     <Checkbox
//                       checked={
//                         selectedDiscounts[discount.condition]?.id ===
//                         discount.id
//                       }
//                       onChange={() => handleSelectDiscount(discount)}
//                       className={styles.discountCheckbox}
//                     />
//                     <p>
//                       Mã: <strong>{discount.name}</strong> - Giảm:{" "}
//                       {discount.discountType === "PERCENTAGE"
//                         ? `${discount.discountValue}%`
//                         : `${new Intl.NumberFormat("vi-VN").format(discount.discountValue)} đ`}{" "}
//                       (
//                       {discount.condition === "TOTAL"
//                         ? "Tổng đơn"
//                         : "Phí vận chuyển"}
//                       )
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Phương thức thanh toán */}
//           <div className={styles.section}>
//             <h2 className={styles.sectionTitle}>Phương thức thanh toán</h2>
//             <Radio.Group
//               onChange={(e) => setPaymentMethod(e.target.value)}
//               value={paymentMethod}
//               className={styles.paymentMethods}
//             >
//               <Radio value="COD" className={styles.paymentItem}>
//                 Thanh toán khi nhận hàng (COD)
//               </Radio>
//               <Radio value="VNPAY" className={styles.paymentItem}>
//                 Thanh toán qua VNPAY
//               </Radio>
//             </Radio.Group>
//           </div>

//           {/* Danh sách sản phẩm */}
//           <div className={styles.section}>
//             <h2 className={styles.sectionTitle}>Sản phẩm thanh toán</h2>
//             <div className={styles.itemList}>
//               {checkoutItems.map((item, index) => (
//                 <div key={index} className={styles.item}>
//                   <img
//                     src={item.image || placeholderImage}
//                     alt={item.productDetails.product.name}
//                     className={styles.itemImage}
//                     onError={(e) => {
//                       if (e.target.src !== placeholderImage) {
//                         e.target.src = placeholderImage;
//                       }
//                     }}
//                   />
//                   <div className={styles.itemDetails}>
//                     <h3 className={styles.itemName}>
//                       {item.productDetails.product.name}
//                     </h3>
//                     <p className={styles.itemVariant}>
//                       Màu sắc: {item.productDetails.color} | Kích thước:{" "}
//                       {item.productDetails.size}
//                     </p>
//                     <p className={styles.itemQuantity}>
//                       Số lượng: {item.quantity}
//                     </p>
//                     <p className={styles.itemPrice}>
//                       Giá: {new Intl.NumberFormat("vi-VN").format(item.price)} đ
//                     </p>
//                     <p className={styles.itemTotal}>
//                       Tổng:{" "}
//                       {new Intl.NumberFormat("vi-VN").format(item.totalPrice)} đ
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div className={styles.total}>
//               <div>
//                 <p>Tổng tiền hàng:</p>
//                 <p>Phí vận chuyển:</p>
//                 <p>Giảm giá:</p>
//                 <p className={styles.totalLabel}>Tổng thanh toán:</p>
//               </div>
//               <div>
//                 <p>{new Intl.NumberFormat("vi-VN").format(totalAmount)} đ</p>
//                 <p>{new Intl.NumberFormat("vi-VN").format(shippingFee)} đ</p>
//                 <p>
//                   {new Intl.NumberFormat("vi-VN").format(
//                     calculateDiscountAmount(),
//                   )}{" "}
//                   đ
//                 </p>
//                 <p className={styles.totalAmount}>
//                   {new Intl.NumberFormat("vi-VN").format(finalTotal)} đ
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Nút xác nhận */}
//           <div className={styles.actions}>
//             <Button
//               type="primary"
//               className={styles.confirmButton}
//               onClick={handleConfirmCheckout}
//               loading={isLoading}
//               disabled={!selectedAddress}
//             >
//               Xác nhận thanh toán
//             </Button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default CheckoutPage;

import React, { useState, useEffect } from "react";
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
} from "antd";
import placeholderImage from "../../assets/images/daychuyen1/vyn13-t-1-1659674319051.webp";
import privateAxios from "../../services/api/privateAxios"; // Giả định có privateAxios

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
  const [form] = Form.useForm();
  const [shippingFee, setShippingFee] = useState(0);
  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState({
    TOTAL: null,
    SHIPPING: null,
  });

  const breadcrumbItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Giỏ hàng", path: "/cart/gio-hang-cua-ban" },
    { label: "Thanh toán" },
  ];

  // Tính giá trị giảm giá
  const calculateDiscountAmount = () => {
    let productDiscount = 0;
    let shippingFreeDiscount = 0;
    if (selectedDiscounts.TOTAL) {
      const discount = selectedDiscounts.TOTAL;
      if (discount.discountType === "PERCENTAGE") {
        productDiscount +=
          (totalAmount * parseFloat(discount.discountValue)) / 100;
      } else if (discount.discountType === "FIXED") {
        productDiscount += parseFloat(discount.discountValue);
      }
    }
    if (selectedDiscounts.SHIPPING) {
      const discount = selectedDiscounts.SHIPPING;
      if (discount.discountType === "PERCENTAGE") {
        shippingFreeDiscount +=
          (shippingFee * parseFloat(discount.discountValue)) / 100;
      } else if (discount.discountType === "FIXED") {
        shippingFreeDiscount += parseFloat(discount.discountValue);
      }
    }
    return { productDiscount, shippingFreeDiscount };
  };

  // Tổng thanh toán sau giảm giá
  const { productDiscount, shippingFreeDiscount } = calculateDiscountAmount();
  const finalTotal =
    totalAmount + shippingFee - (productDiscount + shippingFreeDiscount);

  // Lấy danh sách địa chỉ
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await getAddresses();
        console.log("Địa chỉ nhận được:", response);
        setAddresses(response || []);
        setShippingFee(0);
      } catch (error) {
        console.error("Lỗi khi lấy địa chỉ:", error);
        notification.error({
          message: "Thông báo",
          description: "Không thể tải danh sách địa chỉ, vui lòng thử lại",
          duration: 3,
        });
        setShippingFee(0);
      }
    };
    fetchAddresses();
  }, []);

  // Gọi API lấy mã giảm giá
  useEffect(() => {
    const fetchAvailableDiscounts = async () => {
      try {
        console.log("Gọi getAvailableDiscounts với:", {
          totalAmount,
          shippingFee,
        });
        const response = await getAvailableDiscounts({
          totalAmount,
          shippingFee,
        });
        console.log("Mã giảm giá nhận được:", response);
        setAvailableDiscounts(response || []);
      } catch (error) {
        console.error("Lỗi khi lấy mã giảm giá:", error);
        notification.error({
          message: "Thông báo",
          description: "Không thể lấy danh sách mã giảm giá, vui lòng thử lại",
          duration: 3,
        });
        setAvailableDiscounts([]);
      }
    };
    if (totalAmount > 0) {
      fetchAvailableDiscounts();
    } else {
      console.warn("totalAmount không hợp lệ, không gọi getAvailableDiscounts");
      setAvailableDiscounts([]);
    }
  }, [totalAmount, shippingFee]);

  // Xử lý chọn/hủy chọn mã giảm giá
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

  // Xử lý chọn địa chỉ
  const handleSelectAddress = async (addressId) => {
    setSelectedAddress(addressId);
    const address = addresses.find((addr) => addr.id === addressId);
    if (address && checkoutItems?.length > 0) {
      if (
        address.street &&
        address.city &&
        address.country &&
        checkoutItems.every((item) => item.productDetails?.id)
      ) {
        console.log("Gọi calculateShipping khi chọn địa chỉ:", address);
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
          console.log("Phí vận chuyển nhận được:", response);
          setShippingFee(response.shippingFee || 0);
        } catch (error) {
          console.error("Lỗi khi tính phí vận chuyển:", error);
          notification.error({
            message: "Thông báo",
            description: "Không thể tính phí vận chuyển, vui lòng thử lại",
            duration: 3,
          });
          setShippingFee(0);
        }
      } else {
        console.warn("Dữ liệu không đủ để tính phí vận chuyển:", {
          address,
          checkoutItems,
        });
        setShippingFee(0);
      }
    } else {
      console.warn("Không có địa chỉ hoặc sản phẩm để tính phí vận chuyển");
      setShippingFee(0);
    }
  };

  // Xử lý thêm địa chỉ mới
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
        console.log("Gọi calculateShipping cho địa chỉ mới:", newAddress);
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
          console.log("Phí vận chuyển nhận được:", response);
          setShippingFee(response.shippingFee || 0);
        } catch (error) {
          console.error("Lỗi khi tính phí vận chuyển:", error);
          notification.error({
            message: "Thông báo",
            description: "Không thể tính phí vận chuyển, vui lòng thử lại",
            duration: 3,
          });
          setShippingFee(0);
        }
      } else {
        console.warn("Không có sản phẩm để tính phí vận chuyển");
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
      console.error("Lỗi khi thêm địa chỉ:", error);
      notification.error({
        message: "Thông báo",
        description: "Thêm địa chỉ thất bại, vui lòng thử lại",
        duration: 3,
      });
    }
  };

  // Xử lý xác nhận thanh toán
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
      const addressData = address.id.startsWith("temp-")
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
        shippingFreeDiscount,
        productDiscount,
        finalTotal,
      };

      console.log("Gửi payload checkout:", payload);

      const response = await privateAxios.post(
        "/api/v1/payment/checkout",
        payload,
      );
      console.log("Phản hồi checkout:", response.data);

      notification.success({
        message: "Thông báo",
        description: response.data.message || "Xác nhận đơn hàng thành công",
        duration: 3,
      });
      navigate("/order-success");
    } catch (error) {
      console.error("Lỗi khi xác nhận thanh toán:", error);
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
      <Breadcrumb items={breadcrumbItems} />
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Thanh toán đơn hàng</h1>
        <div className={styles.checkout}>
          {/* Thông tin người dùng */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Thông tin người nhận</h2>
            <div className={styles.userInfo}>
              <p>
                <strong>Họ tên:</strong> {user.username || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {user.email || "N/A"}
              </p>
              <p>
                <strong>Số điện thoại:</strong>{" "}
                {user.profile?.phoneNumber || "N/A"}
              </p>
            </div>
          </div>

          {/* Địa chỉ giao hàng */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Địa chỉ giao hàng</h2>
            {addresses.length === 0 ? (
              <p className={styles.empty}>Chưa có địa chỉ nào được thêm</p>
            ) : (
              <div className={styles.addressList}>
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`${styles.addressItem} ${
                      selectedAddress === address.id ? styles.selected : ""
                    }`}
                    onClick={() => handleSelectAddress(address.id)}
                  >
                    <div className={styles.addressContent}>
                      <p className={styles.addressText}>
                        {address.street}, {address.city}, {address.country}
                      </p>
                    </div>
                    <Radio
                      checked={selectedAddress === address.id}
                      className={styles.addressRadio}
                    />
                  </div>
                ))}
              </div>
            )}
            <Button
              type="link"
              onClick={() => setIsModalVisible(true)}
              className={styles.addAddressBtn}
            >
              Thêm địa chỉ mới
            </Button>
          </div>

          {/* Modal thêm địa chỉ */}
          <Modal
            title="Thêm địa chỉ mới"
            open={isModalVisible}
            onCancel={() => {
              setIsModalVisible(false);
              form.resetFields();
            }}
            footer={null}
          >
            <Form form={form} onFinish={handleAddAddress} layout="vertical">
              <Form.Item
                name="street"
                label="Đường"
                rules={[{ required: true, message: "Vui lòng nhập tên đường" }]}
              >
                <Input placeholder="Nhập tên đường" />
              </Form.Item>
              <Form.Item
                name="city"
                label="Thành phố"
                rules={[{ required: true, message: "Vui lòng nhập thành phố" }]}
              >
                <Input placeholder="Nhập thành phố" />
              </Form.Item>
              <Form.Item
                name="country"
                label="Quốc gia"
                initialValue="VN"
                rules={[{ required: true, message: "Vui lòng nhập quốc gia" }]}
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

          {/* Mã giảm giá */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Mã giảm giá</h2>
            {availableDiscounts.length === 0 ? (
              <p className={styles.empty}>Không có mã giảm giá khả dụng</p>
            ) : (
              <div className={styles.discountList}>
                {availableDiscounts.map((discount) => (
                  <div key={discount.id} className={styles.discountItem}>
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
                        ? "Tổng đơn"
                        : "Phí vận chuyển"}
                      )
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phương thức thanh toán */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Phương thức thanh toán</h2>
            <Radio.Group
              onChange={(e) => setPaymentMethod(e.target.value)}
              value={paymentMethod}
              className={styles.paymentMethods}
            >
              <Radio value="COD" className={styles.paymentItem}>
                Thanh toán khi nhận hàng (COD)
              </Radio>
              <Radio value="VNPAY" className={styles.paymentItem}>
                Thanh toán qua VNPAY
              </Radio>
            </Radio.Group>
          </div>

          {/* Danh sách sản phẩm */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Sản phẩm thanh toán</h2>
            <div className={styles.itemList}>
              {checkoutItems.map((item, index) => (
                <div key={index} className={styles.item}>
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
                      Giá: {new Intl.NumberFormat("vi-VN").format(item.price)} đ
                    </p>
                    <p className={styles.itemTotal}>
                      Tổng:{" "}
                      {new Intl.NumberFormat("vi-VN").format(item.totalPrice)} đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.total}>
              <div>
                <p>Tổng tiền hàng:</p>
                <p>Phí vận chuyển:</p>
                <p>Giảm giá sản phẩm:</p>
                <p>Giảm giá vận chuyển:</p>
                <p className={styles.totalLabel}>Tổng thanh toán:</p>
              </div>
              <div>
                <p>{new Intl.NumberFormat("vi-VN").format(totalAmount)} đ</p>
                <p>{new Intl.NumberFormat("vi-VN").format(shippingFee)} đ</p>
                <p>
                  {new Intl.NumberFormat("vi-VN").format(productDiscount)} đ
                </p>
                <p>
                  {new Intl.NumberFormat("vi-VN").format(shippingFreeDiscount)}{" "}
                  đ
                </p>
                <p className={styles.totalAmount}>
                  {new Intl.NumberFormat("vi-VN").format(finalTotal)} đ
                </p>
              </div>
            </div>
          </div>

          {/* Nút xác nhận */}
          <div className={styles.actions}>
            <Button
              type="primary"
              className={styles.confirmButton}
              onClick={handleConfirmCheckout}
              loading={isLoading}
              disabled={!selectedAddress}
            >
              Xác nhận thanh toán
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
