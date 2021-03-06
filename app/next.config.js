/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  images: {
    domains: ['api.lorem.space'],
  },
};