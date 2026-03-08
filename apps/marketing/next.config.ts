import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/app/:path*",
        destination: `${process.env.DASHBOARD_URL || "https://xiri-os-dashboard.vercel.app"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
