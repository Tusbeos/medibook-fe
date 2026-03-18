import axios, { AxiosError } from "axios";
import tokenManager from "./utils/tokenManager";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true,
});

// Gắn token JWT vào header Authorization cho mọi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý response: trả về data trực tiếp & auto logout/refresh khi 401
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 (Unauthorized) và request chưa được retry, và không phải URL đăng nhập hoặc làm mới token
    if (
        error.response &&
        error.response.status === 401 &&
        originalRequest &&
        !(originalRequest as any)._retry &&
        originalRequest.url !== '/api/auth/login' &&
        originalRequest.url !== '/api/auth/refresh'
    ) {
        (originalRequest as any)._retry = true;

        try {
            const refreshToken = tokenManager.getRefreshToken();
            if (!refreshToken) {
                // Không có refresh token -> từ bỏ, logout
                tokenManager.triggerLogout();
                return Promise.reject(error);
            }

            // Gọi API đổi token mới
            const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/refresh`, {
                refreshToken: refreshToken
            });

            if (res.data && res.data.data && res.data.data.token) {
                const newToken = res.data.data.token;
                const newRefreshToken = res.data.data.refreshToken;

                // Cập nhật token trong tokenManager
                tokenManager.setToken(newToken, newRefreshToken);

                // Gắn token mới vào request bị lỗi và gửi lại
                originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
                const retryResponse = await axiosInstance(originalRequest);
                
                // Trả data của request retry
                return retryResponse;
            } else {
                // Call refresh API lỗi -> logout
                tokenManager.triggerLogout();
                return Promise.reject(error);
            }
        } catch (refreshError) {
            // Lỗi khi request refresh token -> auto logout
            tokenManager.triggerLogout();
            return Promise.reject(refreshError);
        }
    }

    // Các lỗi khác xử lý văng ra ngoài
    return Promise.reject(error);
  }
);

export default axiosInstance;
