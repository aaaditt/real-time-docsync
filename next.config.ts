import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fallbacks for node modules missing in the browser used by y-supabase
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        events: false,
        net: false,
        tls: false,
      };
    }
    // y-supabase has some circular dependencies that crash Turbopack / Webpack 5
    config.ignoreWarnings = [
      { module: /node_modules\/y-supabase/ },
      { module: /node_modules\/y-protocols/ },
      { module: /node_modules\/yjs/ }
    ];
    return config;
  },
};

export default nextConfig;
