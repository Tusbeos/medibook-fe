import { Buffer } from "buffer";

const DEFAULT_IMAGE_MIME = "image/jpeg";

class CommonUtils {
  static getBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}

export const normalizeImageSrc = (
  image: any,
  mimeType = DEFAULT_IMAGE_MIME,
): string => {
  if (!image) return "";

  if (typeof image === "object" && image.type === "Buffer" && image.data) {
    const base64String = Buffer.from(image.data).toString("base64");
    return `data:${mimeType};base64,${base64String}`;
  }

  if (typeof image !== "string") return "";

  const trimmed = image.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  if (trimmed.startsWith("data:image")) {
    return trimmed;
  }

  if (trimmed.startsWith("ZGF0Y")) {
    try {
      return Buffer.from(trimmed, "base64").toString("utf-8");
    } catch (e) {
      return "";
    }
  }

  return `data:${mimeType};base64,${trimmed}`;
};

export const toImageCssUrl = (image: any, mimeType = DEFAULT_IMAGE_MIME) => {
  const src = normalizeImageSrc(image, mimeType);
  return src ? `url(${src})` : "";
};

export const getBase64FromBuffer = normalizeImageSrc;

/**
 * Remove Vietnamese diacritics and normalize to ASCII lowercase
 * "Nguyễn Văn Á" → "nguyenvana"
 */
export const removeVietnameseDiacritics = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
};

/**
 * Generate email for doctor (R2): lastName+firstName@medibook.com
 * Generate email: R2 doctor → lastName+firstName@medibook.com, R4 clinic manager → firstName@mgr.medibook.com
 */
export const generateMedibookEmail = (
  firstName: string,
  lastName?: string,
  role?: string,
): string => {
  const first = removeVietnameseDiacritics(firstName.trim());
  const last = lastName ? removeVietnameseDiacritics(lastName.trim()) : "";
  const localPart = last ? `${last}${first}` : first;
  const domain = role === "R4" ? "@mgr.medibook.com" : "@medibook.com";
  return localPart ? `${localPart}${domain}` : "";
};

export default CommonUtils;
