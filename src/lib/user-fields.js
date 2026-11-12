/**
 * Helpers for the standard `user` document fields (the "Md Mohebul" shape):
 *   location: { country, division, district, area }   — all four keys, "" when unknown
 *   contact:  "+880…" string                          — "+880" alone means "not set"
 */

export const EMPTY_LOCATION = Object.freeze({
  country: "Bangladesh",
  division: "",
  district: "",
  area: "",
});

/** Always returns a full location object. A legacy free-text string goes into `area`. */
export function toLocationObject(loc) {
  if (loc && typeof loc === "object") {
    return {
      country: loc.country || EMPTY_LOCATION.country,
      division: loc.division ?? "",
      district: loc.district ?? "",
      area: loc.area ?? "",
    };
  }
  if (typeof loc === "string" && loc.trim()) {
    return { ...EMPTY_LOCATION, area: loc.trim() };
  }
  return { ...EMPTY_LOCATION };
}

/**
 * "area, district, division, country" — same output as the backend's
 * `formatSellerLocation`, which builds the products' `location1` snapshot.
 */
export function formatLocation(loc) {
  if (!loc) return "";
  if (typeof loc === "object") {
    return [loc.area, loc.district, loc.division, loc.country].filter(Boolean).join(", ");
  }
  return String(loc);
}

/**
 * Normalize a Bangladeshi phone number to "+880XXXXXXXXXX".
 * Accepts "+8801712345678", "8801712345678", "01712345678" or "1712345678".
 * Empty input returns "+880" (the "not set" default used at sign-up).
 */
export function normalizeContact(input) {
  let num = String(input ?? "").replace(/\D/g, "");
  if (num.startsWith("880")) num = num.slice(3);
  if (num.startsWith("0") && num.length === 11) num = num.slice(1);
  return `+880${num}`;
}
