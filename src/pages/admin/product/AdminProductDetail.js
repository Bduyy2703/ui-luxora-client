import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronRight,
    faChevronLeft,
    faArrowUpWideShort,
    faArrowUpShortWide,
} from "@fortawesome/free-solid-svg-icons";
import config from "../../../config";

const AdminProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState([]);
    const [cates, setCates] = useState([]);
    const [images, setImages] = useState([]);
    const [hasNewImages, setHasNewImages] = useState(false);

    const fetchProduct = useCallback(async () => {
        // Fetch product được chọn
        try {
            const res = await axios.get(
                `${config.API_URL}admin/getAllProducts`
            );
            const data = res.data.products.find((product) => {
                return product._id === id;
            });
            setImages(data.product_details.product_images);
            setProduct(data);

            const resCate = await axios.get(
                `${config.API_URL}admin/getAllCategories`
            );
            setCates(resCate.data.categories);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }, [id]);

    // MAIN
    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    const formik = useFormik({
        enableReinitialize: true, // Cho phép thay đổi initialValues khi user thay đổi
        initialValues: {
            product_code: product.product_code,
            product_name: product.product_name,
            product_price: product.product_price,
            product_sale_price: product.product_sale_price,
            product_category: product.product_category
                ? product.product_category._id
                : null,
            product_sale_price: product.product_sale_price,
            product_images: product.product_details
                ? product.product_details.product_images
                : [],
            createdAt: product.createdAt
                ? new Date(product.createdAt).toISOString().split("T")[0]
                : "1999-01-01",
            product_short_description: product.product_short_description,
            material: product.product_details
                ? product.product_details.material
                : "",
            color: product.product_details ? product.product_details.color : "",
            length: product.product_details
                ? product.product_details.length
                : "",
            care_instructions: product.product_details
                ? product.product_details.care_instructions
                : "",
            stone_size: product.product_details
                ? product.product_details.stone_size
                : "",
            stone_type: product.product_details
                ? product.product_details.stone_type
                : "",
            design_style: product.product_details
                ? product.product_details.design_style
                : "",
        },
        onSubmit: async (values) => {
            try {
                Swal.fire({
                    title: "Nhắc nhở",
                    text: "Bạn có chắc chắn muốn cập nhật thông tin không?",
                    icon: "info",
                    showCancelButton: true, // Show cancel button
                    confirmButtonText: "Cập nhập!",
                    cancelButtonText: "Hủy bỏ",
                    reverseButtons: true, // Optional: makes cancel button appear on the left
                    timerProgressBar: true,
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        const formData = new FormData();
                        formData.append("product_code", values.product_code);
                        formData.append("product_name", values.product_name);
                        formData.append("product_price", values.product_price);
                        formData.append(
                            "product_sale_price",
                            values.product_sale_price
                        );
                        formData.append(
                            "product_category",
                            values.product_category
                        );
                        formData.append(
                            "product_short_description",
                            values.product_short_description
                        );

                        formData.append(
                            "product_details",
                            JSON.stringify({
                                material: "Vàng",
                                color: "vàng",
                                length: "40cm",
                                design_style: "Cổ điển",
                            })
                        );
                        const productImages =
                            document.querySelector('input[type="file"]').files;
                        // Append images
                        for (let i = 0; i < productImages.length; i++) {
                            formData.append("product_images", productImages[i]);
                        }
                        await axios.put(
                            `${config.API_URL}products/${id}`,
                            formData,
                            {
                                headers: {
                                    "Content-Type": "multipart/form-data",
                                },
                            }
                        );
                        Swal.fire({
                            title: "Cập nhập thành công!",
                            text: "Bạn đã cập nhật thông tin thành công.",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    }
                });
            } catch (error) {
                Swal.fire({
                    title: "Cập nhập không thành công!",
                    icon: "error",
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                });
            }
        },
    });

    const handleReset = () => {
        formik.resetForm();
    };
    // Hàm handleImageChange
    const handleImageChange = (e) => {
        const files = e.target.files; // Lấy mảng các tệp
        setHasNewImages(true);
        formik.setFieldValue("product_images", files); // Cập nhật giá trị cho Formik
    };

    return (
        <div className='wrapper'>
            <header className='admin-header'>
                <div className='container'>
                    <h2>Thông tin sản phẩm</h2>
                </div>
            </header>
            <main className='admin-main'>
                <div className='container' style={{ justifyContent: "center" }}>
                    <div className='card col col-8'>
                        <form onSubmit={formik.handleSubmit}>
                            <div className='modal-form-header'>
                                <h2>Thông tin chi tiết</h2>
                            </div>
                            <div className='modal-two-body'>
                                <div
                                    className='modal-form-body'
                                    style={{ width: "365px" }}
                                >
                                    <label>Mã sản phẩm</label>
                                    <input
                                        className='disabled'
                                        type='text'
                                        name='product_code'
                                        required
                                        {...formik.getFieldProps(
                                            "product_code"
                                        )}
                                        disabled
                                    />
                                    <label>Tên sản phẩm</label>
                                    <input
                                        type='text'
                                        name='product_name'
                                        required
                                        {...formik.getFieldProps(
                                            "product_name"
                                        )}
                                    />
                                    <label>Giá nhập</label>
                                    <input
                                        type='number'
                                        name='product_price'
                                        required
                                        {...formik.getFieldProps(
                                            "product_price"
                                        )}
                                    />
                                    <label>Giá bán</label>
                                    <input
                                        type='number'
                                        name='product_sale_price'
                                        required
                                        {...formik.getFieldProps(
                                            "product_sale_price"
                                        )}
                                    />
                                    <label>Danh mục</label>
                                    <select
                                        name='product_category'
                                        {...formik.getFieldProps(
                                            "product_category"
                                        )}
                                    >
                                        <option
                                            disabled
                                            hidden
                                            selected={
                                                !product.product_category
                                                    ? true
                                                    : false
                                            }
                                        />
                                        {cates.map((cate, index) => (
                                            <option
                                                key={index}
                                                value={cate._id}
                                                selected={
                                                    product.product_category
                                                        ? cate._id ===
                                                          product
                                                              .product_category
                                                              ._id
                                                        : false
                                                }
                                                label={cate.category_name}
                                            ></option>
                                        ))}
                                    </select>
                                    <label>Tình trạng</label>
                                    <select
                                        name='product_isAvailable'
                                        {...formik.getFieldProps(
                                            "product_isAvailable"
                                        )}
                                    >
                                        <option
                                            value={"true"}
                                            label={"Còn hàng"}
                                        ></option>
                                        <option
                                            value={"false"}
                                            label={"Hết hàng"}
                                        ></option>
                                    </select>
                                    <label>Ngày tạo</label>
                                    <input
                                        type='date'
                                        name='createdAt'
                                        required
                                        {...formik.getFieldProps("createdAt")}
                                        disabled
                                    />
                                    <label>Mô tả</label>
                                    <input
                                        type='text'
                                        name='product_short_description'
                                        required
                                        {...formik.getFieldProps(
                                            "product_short_description"
                                        )}
                                    />
                                </div>
                                <div
                                    className='modal-form-body'
                                    style={{ width: "365px" }}
                                >
                                    <label>Chất liệu</label>
                                    <input
                                        type='text'
                                        name='material'
                                        required
                                        {...formik.getFieldProps("material")}
                                    />
                                    <label>Màu sắc</label>
                                    <input
                                        type='text'
                                        name='color'
                                        required
                                        {...formik.getFieldProps("color")}
                                    />
                                    <label>Kích thước</label>
                                    <input
                                        type='text'
                                        name='length'
                                        required
                                        {...formik.getFieldProps("length")}
                                    />
                                    <label>Lưu ý</label>
                                    <input
                                        type='text'
                                        name='care_instructions'
                                        required
                                        {...formik.getFieldProps(
                                            "care_instructions"
                                        )}
                                    />
                                    <label>Kích thước đá quý</label>
                                    <input
                                        type='text'
                                        name='stone_size'
                                        required
                                        {...formik.getFieldProps("stone_size")}
                                    />
                                    <label>Loại đá</label>
                                    <input
                                        type='text'
                                        name='stone_type'
                                        required
                                        {...formik.getFieldProps("stone_type")}
                                    />
                                    <label>Thiết kế</label>
                                    <input
                                        type='text'
                                        name='design_style'
                                        required
                                        {...formik.getFieldProps(
                                            "design_style"
                                        )}
                                    />
                                    <label>Hình ảnh mới</label>
                                    <input
                                        id='product_images'
                                        name='product_images'
                                        type='file'
                                        multiple // Cho phép chọn nhiều tệp
                                        onChange={handleImageChange} // Sử dụng hàm tự tạo để xử lý thay đổi tệp
                                    />
                                </div>
                            </div>
                            <div className='modal-form-footer'>
                                <button
                                    type='button'
                                    onClick={handleReset}
                                    className='admin-btn res-btn'
                                >
                                    Reset
                                </button>
                                <button type='submit' className='admin-btn'>
                                    Cập nhập
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminProductDetail;