import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// State để track refreshing
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    const url = config.url || "";
    const isAuthApi = url.includes("/api/xacthuc");

    if (token && !isAuthApi) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log(
      "🔍 Axios Error Response:",
      error.response?.status,
      error.response?.data
    );

    // SỬA: Kiểm tra 401 và error code
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/xacthuc/")
    ) {
      console.log(
        "🔄 Received 401, checking error code...",
        error.response?.data
      );

      // Kiểm tra xem có phải token expired không
      const errorData = error.response?.data;
      if (errorData?.code === "TOKEN_EXPIRED") {
        console.log("🔄 Token expired, attempting refresh...");

        if (isRefreshing) {
          console.log("⏳ Already refreshing, queueing request...");
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          showRefreshLoading();

          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) {
            throw new Error("No refresh token");
          }

          console.log("🔄 Calling refresh API...");
          const response = await axios.post(
            `${API_BASE_URL}/api/xacthuc/refresh`,
            { refreshToken }
          );

          console.log("✅ Refresh successful:", response.data);

          const {
            token,
            refreshToken: newRefreshToken,
            role,
            name,
          } = response.data;

          // Lưu token mới
          localStorage.setItem("authToken", token);
          localStorage.setItem("refreshToken", newRefreshToken);
          localStorage.setItem("role", role);
          localStorage.setItem("name", name);

          // Update axios default headers
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Process queued requests
          processQueue(null, token);
          hideRefreshLoading();

          // Retry original request với token mới
          originalRequest.headers.Authorization = `Bearer ${token}`;
          console.log("🔄 Retrying original request with new token...");
          return api(originalRequest);
        } catch (refreshError) {
          console.error("❌ Refresh failed:", refreshError);

          // Refresh failed - logout user
          processQueue(refreshError, null);
          localStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("role");
          localStorage.removeItem("name");
          hideRefreshLoading();

          // Redirect to login
          console.log("🚪 Redirecting to login...");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        console.log("🚪 Token invalid (not expired), redirecting to login...");
        // Token không hợp lệ vì lý do khác
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Loading functions
let loadingElement: HTMLElement | null = null;

const showRefreshLoading = () => {
  if (loadingElement) return;

  loadingElement = document.createElement("div");
  loadingElement.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      color: white;
      font-size: 18px;
    ">
      <div style="text-align: center;">
        <div style="
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 2s linear infinite;
          margin: 0 auto 20px;
        "></div>
        Đang xác thực lại...
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </div>
  `;
  document.body.appendChild(loadingElement);
};

const hideRefreshLoading = () => {
  if (loadingElement) {
    document.body.removeChild(loadingElement);
    loadingElement = null;
  }
};

// SỬA: Tạo object có tất cả methods của axios và api instance
const axiosWithMethods = {
  // Expose all axios static methods
  get: api.get.bind(api),
  post: api.post.bind(api),
  put: api.put.bind(api),
  patch: api.patch.bind(api),
  delete: api.delete.bind(api),
  head: api.head.bind(api),
  options: api.options.bind(api),
  request: api.request.bind(api),

  // Expose axios utilities
  isAxiosError: axios.isAxiosError,
  CancelToken: axios.CancelToken,
  Cancel: axios.Cancel,
  isCancel: axios.isCancel,
  all: axios.all,
  spread: axios.spread,

  // Expose instance properties
  defaults: api.defaults,
  interceptors: api.interceptors,

  // Create method để tạo instance mới nếu cần
  create: axios.create,

  // Expose the configured instance
  api: api,
};

// Export as default để các file khác có thể import axios from './axiosConfig'
export default axiosWithMethods;

// Export named exports để backward compatibility
export const isAxiosError = axios.isAxiosError;
export { api };
