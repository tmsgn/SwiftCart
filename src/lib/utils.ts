import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export const generateSKU = (
  name: string,
  category: string,
  brand: string,
  variantValues: string[]
): string => {
  const getCode = (str: string, len: number = 3) =>
    str.replace(/[^a-zA-Z0-9]/g, "").substring(0, len).toUpperCase();

  const nameCode = getCode(name);
  const categoryCode = getCode(category);
  const brandCode = getCode(brand);

  const variantCodes = variantValues.map((val) => getCode(val)).join("-");

  const skuParts = [nameCode, categoryCode, brandCode, variantCodes].filter(Boolean);
  
  return skuParts.join("-");
};
