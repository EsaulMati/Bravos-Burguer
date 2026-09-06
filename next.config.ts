import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const lanDevOrigins = Object.values(networkInterfaces())
  .flatMap((addresses) => addresses ?? [])
  .filter((address) => address.family === "IPv4" && !address.internal)
  .map((address) => address.address);

const nextConfig: NextConfig = {
  agentRules: false,
  allowedDevOrigins: lanDevOrigins,
};

export default nextConfig;
