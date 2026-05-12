export function parsePrice(price: string | number | null | undefined): number | null {
  if (typeof price === "number" && Number.isFinite(price)) {
    return price;
  }

  if (!price || typeof price !== "string") {
    return null;
  }

  const numericText = price
    .replace(/[^\d,.]/g, "")
    .trim();

  if (!numericText) {
    return null;
  }

  const lastComma = numericText.lastIndexOf(",");
  const lastDot = numericText.lastIndexOf(".");
  const decimalSeparator = lastComma > lastDot ? "," : ".";

  const normalized = numericText
    .replace(new RegExp(`\\${decimalSeparator === "," ? "." : ","}`, "g"), "")
    .replace(decimalSeparator, ".");

  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
}
