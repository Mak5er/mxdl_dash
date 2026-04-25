import type { NextConfig } from "next";

function getPublicUrl() {
  const value = process.env.DASHBOARD_PUBLIC_URL?.trim();
  if (!value) {
    return null;
  }

  const normalizedValue = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    return new URL(normalizedValue);
  } catch {
    return null;
  }
}

function getAllowedDevOrigins(publicUrl: URL | null) {
  if (!publicUrl) {
    return undefined;
  }

  return [publicUrl.port ? `${publicUrl.hostname}:${publicUrl.port}` : publicUrl.hostname];
}

const publicUrl = getPublicUrl();
const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  allowedDevOrigins: getAllowedDevOrigins(publicUrl),
  async headers() {
    const scriptSrc = isProduction
      ? "'self' 'unsafe-inline'"
      : "'self' 'unsafe-eval' 'unsafe-inline'";
    const securityHeaders = [
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          `script-src ${scriptSrc}`,
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data:",
          "font-src 'self' data:",
          "connect-src 'self'",
          "object-src 'none'",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "manifest-src 'self'",
          "worker-src 'self'",
        ].join("; "),
      },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
      },
    ];

    if (isProduction && publicUrl?.protocol === "https:") {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/api/admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
