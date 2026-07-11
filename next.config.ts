import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Turbopack (Next.js 16 default) — no webpack config needed
  turbopack: {},

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },

  // Bundle LangChain / Google AI as server-only — keep out of client bundle
  serverExternalPackages: [
    "@langchain/core",
    "@langchain/groq",
  ],
};

export default nextConfig;
