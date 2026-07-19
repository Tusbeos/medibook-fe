export const ACCOUNT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Đang hoạt động", variant: "success" },
  { value: "PENDING", label: "Chờ kích hoạt", variant: "warning" },
  { value: "DISABLED", label: "Đã vô hiệu hóa", variant: "default" },
  { value: "LOCKED", label: "Đã khóa", variant: "danger" },
] as const;

export type AccountStatus = (typeof ACCOUNT_STATUS_OPTIONS)[number]["value"];
export type AccountStatusVariant =
  (typeof ACCOUNT_STATUS_OPTIONS)[number]["variant"];

export const getAccountStatusMeta = (status?: string | null) =>
  ACCOUNT_STATUS_OPTIONS.find((option) => option.value === status);
