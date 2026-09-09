import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: false,
  experimental: {
    inlineCss: true,
  },
  output: "standalone",
  allowedDevOrigins: ["10.25.5.78"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "amgbearth.myfilebase.com",
      },
    ],
  },
};

export default nextConfig;
