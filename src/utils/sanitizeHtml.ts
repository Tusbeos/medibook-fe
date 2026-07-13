import DOMPurify from "dompurify";

const SANITIZE_OPTIONS = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
};

export const sanitizeHtml = (html?: string | null): string =>
  DOMPurify.sanitize(html || "", SANITIZE_OPTIONS);
