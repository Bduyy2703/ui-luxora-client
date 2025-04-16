import privateAxios from "./privateAxios";

export const updateProfile = async (profileData) => {
  try {
    const response = await privateAxios.put("/v1/profiles", {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phoneNumber: profileData.phoneNumber,
      socialMedia: profileData.socialMedia,
    });
    return response.data || {};
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};
