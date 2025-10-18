import axios from "axios";

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    // Lấy path từ url tuyệt đối hoặc tương đối
    const url = config.url || "";
    const isAuthApi = url.includes("/api/xacthuc");

    if (token && !isAuthApi) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axios;
