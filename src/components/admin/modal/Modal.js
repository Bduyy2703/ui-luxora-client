import React from "react";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import "./modal.css";

const Modal = ({ modal, setModal, title, initialValues, handleAdd }) => {
    const formik = useFormik({
        enableReinitialize: true, // Cho phép thay đổi initialValues khi user thay đổi
        initialValues: Object.keys(initialValues).reduce((values, field) => {
            values[field] = initialValues[field].value;
            return values;
        }, {}),
        onSubmit: async (values, { resetForm }) => {
            try {
                handleAdd(values);
                resetForm();
            } catch (error) {
                Swal.fire({
                    title: "Thêm không thành công!",
                    icon: "error",
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                });
            }
        },
    });

    const handleImageChange = (e) => {
        // Lấy các tệp đã chọn
        const files = e.target.files;
        // Cập nhật tệp vào Formik với `setFieldValue`
        formik.setFieldValue("product_images", files);
    };

    return (
        <div className='modal'>
            <div
                className={`modal-overlay ${modal ? "active" : ""}`}
                onClick={() => {
                    setModal(false);
                    formik.resetForm();
                }}
            ></div>
            <form
                className={`modal-form ${modal ? "active" : ""}`}
                onSubmit={formik.handleSubmit}
            >
                <div className='modal-form-header'>
                    <h2>{title}</h2>
                    <FontAwesomeIcon
                        icon={faXmark}
                        className='icon-hover'
                        onClick={() => setModal(false)}
                    />
                </div>
                <div className='modal-form-body'>
                    {Object.keys(initialValues).map((field) => (
                        <div key={field}>
                            <label htmlFor={field}>
                                {initialValues[field].label}
                            </label>
                            {initialValues[field].type === "select" ? (
                                <select
                                    name={field}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    {initialValues[field].options.map(
                                        (option, index) => (
                                            <option
                                                selected={
                                                    index === 0 ? true : false
                                                }
                                                key={index}
                                                value={
                                                    initialValues[field]
                                                        .options_value[index]
                                                }
                                                label={option}
                                            ></option>
                                        )
                                    )}
                                </select>
                            ) : initialValues[field].type === "file" ? (
                                <input
                                    id={field}
                                    name={field}
                                    type={initialValues[field].type}
                                    multiple
                                    value={formik.values[field]}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    required
                                />
                            ) : (
                                <input
                                    id={field}
                                    name={field}
                                    type={initialValues[field].type}
                                    value={formik.values[field]}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    required
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className='modal-form-footer'>
                    <button type='submit' className='admin-btn'>
                        Xác nhận
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Modal;