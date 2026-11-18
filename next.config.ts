import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Core setting for scalable Docker builds
  compress: true, // Enables gzip compression to reduce network payload
  experimental: {
    // 1. Fixes the 10MB proxy buffer truncation error
    proxyClientMaxBodySize: "50mb", 
    // 2. Extends the Server Actions framework-level limit
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
