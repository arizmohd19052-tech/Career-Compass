/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allows production builds to succeed even with TypeScript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allows production builds to succeed even with ESLint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
