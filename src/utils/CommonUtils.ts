import { Buffer } from "buffer";
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

export const getBase64FromBuffer = (image: any): string => {
  let imageBase64 = "";
  if (!image) return "";
  if (typeof image === "object" && image.type === "Buffer" && image.data) {
    let buffer = new Buffer(image.data);
    let base64String = buffer.toString("base64");
    imageBase64 = `data:image/jpeg;base64,${base64String}`;
  } else if (typeof image === "string") {
    if (image.startsWith("ZGF0Y")) {
      imageBase64 = new Buffer(image, "base64").toString("binary");
    } else if (image.startsWith("data:image")) {
      imageBase64 = image;
    } else {
      imageBase64 = `data:image/jpeg;base64,${image}`;
    }
  }
  return imageBase64;
};

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
