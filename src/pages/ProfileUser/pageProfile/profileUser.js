import React, { useEffect, useState } from "react";
import { Form, Input, Checkbox, Button } from "antd";
import { getProfile, getUserProfile } from "../../../services/api/userService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import PageWrapper from "../../../components/common/layout/PageWrapper";
import useTranslate from "../../../components/hooks/useTranslate";
import { commonMessage } from "../../../components/locales/intl";
import { defineMessages } from "react-intl";
import styles from "./ProfileUser.module.scss";
import Breadcrumb from "../../../components/Breadcrumb";

const messages = defineMessages({
  jewelryTitle: {
    id: "src.pages.Login.index.jewelry",
    defaultMessage: "Jewelry",
  },
});

const ProfileUser = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const email = localStorage.getItem("userEmail");

  const breadcrumbItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Trang khách hàng" },
  ];

  const fetchProfiles = async () => {
    try {
      const profiles = await getProfile();
      return profiles;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách profiles:", error);
    }
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setProfileData(data);
      } catch (err) {
        console.error("Error details:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  console.log("profileData", profileData);

  const defaultAddress =
    profileData?.user?.addresses?.find(
      (address) => address.isDefault === true,
    ) ||
    profileData?.defaultAddress ||
    profileData?.user?.addresses?.[0];

  return (
    <>
      {/* <Breadcrumb items={breadcrumbItems} /> */}
      <div className={styles.profile}>
        <div className={styles.profileUser}>
          <span style={{ fontSize: "24px", fontWeight: "300" }}>
            THÔNG TIN TÀI KHOẢN
          </span>
          {profileData && (
            <div className={styles.user}>
              <div>
                <strong>Họ tên: </strong>
                <span>
                  {profileData.firstName} {profileData.lastName}
                </span>
              </div>
              <div>
                <strong>Email: </strong>
                <span>{profileData.email}</span>
              </div>
              <div>
                <strong>Điện thoại: </strong>
                <span>{profileData.phoneNumber}</span>
              </div>
              <div>
                <strong>Địa chỉ: </strong>
                <span>
                  {defaultAddress
                    ? `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.country}`
                    : "Chưa có địa chỉ"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileUser;
