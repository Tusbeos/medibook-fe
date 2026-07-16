import {
  ARTICLE_STATUS,
  ArticleStatus,
} from "store/api/articleApi";

export const ARTICLE_STATUS_OPTIONS: Array<{
  value: ArticleStatus | "";
  label: string;
}> = [
  { value: "", label: "Tất cả" },
  { value: ARTICLE_STATUS.DRAFT, label: "Bản nháp" },
  { value: ARTICLE_STATUS.PENDING, label: "Chờ duyệt" },
  { value: ARTICLE_STATUS.APPROVED, label: "Đã duyệt" },
  { value: ARTICLE_STATUS.PUBLISHED, label: "Đã xuất bản" },
  { value: ARTICLE_STATUS.REJECTED, label: "Bị từ chối" },
  { value: ARTICLE_STATUS.ARCHIVED, label: "Đã gỡ" },
];

export const formatArticleDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date);
};

export const statusVariant = (status: ArticleStatus) => {
  if (
    status === ARTICLE_STATUS.PUBLISHED ||
    status === ARTICLE_STATUS.APPROVED
  ) {
    return "success" as const;
  }
  if (
    status === ARTICLE_STATUS.PENDING ||
    status === ARTICLE_STATUS.REJECTED
  ) {
    return "warning" as const;
  }
  return "default" as const;
};

export const getApiErrorMessage = (error: any, fallback: string) =>
  error?.data?.message ||
  error?.data?.errMessage ||
  error?.error ||
  error?.message ||
  fallback;
