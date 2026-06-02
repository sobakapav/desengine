import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const rootDir =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: rootDir,
  },
  outputFileTracingIncludes: {
    "/api/**": ["lib/lab/sandpack-templates/**"],
  },
};

export default nextConfig;
