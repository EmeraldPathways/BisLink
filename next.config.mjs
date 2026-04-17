/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next-build',
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] }
};

export default nextConfig;
