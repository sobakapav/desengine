import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    "/api/**": ["lib/lab/sandpack-templates/**"],
  },
};

export default nextConfig;
