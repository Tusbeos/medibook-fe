/**
 * tokenManager.ts
 * Module trung gian quản lý JWT token — không phụ thuộc Redux hay Axios.
 * Giải quyết vấn đề circular dependency: axiosClient ↔ reduxStore.
 */

let _token: string | null = null;
let _refreshToken: string | null = null;
let _onLogout: (() => void) | null = null;

const tokenManager = {
  /** Lấy token hiện tại */
  getToken: (): string | null => _token,
  
  /** Lấy refresh token hiện tại */
  getRefreshToken: (): string | null => _refreshToken,

  /** Cập nhật token và refresh token (gọi khi login thành công) */
  setToken: (token: string | null, refreshToken?: string | null): void => {
    _token = token;
    if (refreshToken !== undefined) _refreshToken = refreshToken;
  },

  /** Xóa token (gọi khi logout) */
  clearToken: (): void => {
    _token = null;
    _refreshToken = null;
  },

  /** Đăng ký handler logout (gọi 1 lần tại index.tsx) */
  setLogoutHandler: (handler: () => void): void => {
    _onLogout = handler;
  },

  /** Kích hoạt logout — dùng bởi Axios interceptor khi nhận 401 */
  triggerLogout: (): void => {
    _onLogout?.();
  },
};

export default tokenManager;
