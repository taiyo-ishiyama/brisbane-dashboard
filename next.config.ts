import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "data.brisbane.qld.gov.au",
      },
    ],
  },
};

export default nextConfig;
