import publicAxios from "./publicAxios";
import privateAxios from "./privateAxios";

export const getAllBlogs = async () => {
  try {
    const response = await publicAxios.get("/v1/blogs");
    return response.data || {};
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { error: error.message };
  }
};

export const getBlogById = async (id) => {
  try {
    const response = await publicAxios.get(`/v1/blogs/${id}`);
    return response.data || {};
  } catch (error) {
    console.error("Error fetching blog details:", error);
    return { error: error.message };
  }
};

export const addBlog = async (blogData) => {
  try {
    const response = await privateAxios.post("/v1/blogs/create", blogData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data || {};
  } catch (error) {
    console.error("Error adding blog:", error);
    throw error;
  }
};

export const updateBlog = async (id, blogData) => {
  try {
    const response = await privateAxios.put(
      `/v1/blogs/update/${id}`,
      blogData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data || {};
  } catch (error) {
    console.error("Error updating blog:", error);
    throw error;
  }
};

export const deleteBlog = async (id) => {
  try {
    const response = await privateAxios.delete(`/v1/blogs/delete/${id}`);
    return response.data || {};
  } catch (error) {
    console.error("Error deleting blog:", error);
    throw error;
  }
};
