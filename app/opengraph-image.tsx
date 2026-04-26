import { ImageResponse } from "next/og";
import { defaultDescription, siteName } from "@/lib/seo";

export const runtime = "edge";
export const alt = "MaxLoad Telegram downloader bot";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#000000",
          color: "#ffffff",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: 72,
          width: "100%",
        }}
      >
        <div
          style={{
            border: "2px solid rgba(255,255,255,0.16)",
            display: "flex",
            flexDirection: "column",
            gap: 28,
            height: "100%",
            justifyContent: "space-between",
            padding: 56,
            width: "100%",
          }}
        >
          <div
            style={{
              color: "#8bd9ff",
              fontSize: 28,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            Telegram downloader bot
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ fontSize: 118, fontWeight: 800, lineHeight: 0.92 }}>
              {siteName}
            </div>
            <div style={{ color: "#d4d4d8", fontSize: 36, lineHeight: 1.25, maxWidth: 860 }}>
              {defaultDescription}
            </div>
          </div>
          <div style={{ color: "#229ED9", fontSize: 30, fontWeight: 700 }}>
            Open @MaxLoadBot
          </div>
        </div>
      </div>
    ),
    size,
  );
}
