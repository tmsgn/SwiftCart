import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  eslint: {
    // Vercel build should not fail on ESLint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
