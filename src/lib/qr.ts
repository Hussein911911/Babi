import QRCode from "qrcode";
import { headers } from "next/headers";

/** Absolute origin of the current request (works behind the preview proxy) */
export function requestOrigin() {
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function qrDataURL(text: string, dark = "#0E1116", light = "#ffffff") {
  return QRCode.toDataURL(text, {
    width: 360,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark, light },
  });
}
