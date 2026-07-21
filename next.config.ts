import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin ships ESM in a way Next.js's bundler mishandles (ERR_REQUIRE_ESM
  // at runtime on Vercel) — keep it external so it's loaded via native require() instead.
  serverExternalPackages: ["firebase-admin"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
