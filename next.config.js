/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  compress: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig