import { toCyrillicUz } from "./cyrillic";

export function localizeText(value, language = "uz") {
  if (value == null) {
    return "";
  }

  if (typeof value !== "string") {
    return value;
  }

  return language === "ru" ? toCyrillicUz(value) : value;
}
