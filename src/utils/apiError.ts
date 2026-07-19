export const getApiErrorMessage = (error: any, fallback: string) =>
  error?.data?.errMessage ||
  error?.data?.message ||
  error?.errMessage ||
  error?.message ||
  error?.response?.data?.errMessage ||
  error?.response?.data?.message ||
  fallback;
