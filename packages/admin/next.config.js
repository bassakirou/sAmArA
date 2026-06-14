/** @type {import('next').NextConfig} */
const runtimeCaching = require('next-pwa/cache');
const { i18n } = require('./next-i18next.config');
const withPWA = require('next-pwa')({
  disable: process.env.NODE_ENV === 'development',
  dest: 'public',
  runtimeCaching,
});

module.exports = withPWA({
  reactStrictMode: true,
  i18n,
  images: {
    domains: [
      'api.samara-shopping.com', // Production
      '127.0.0.1', // Local
      'localhost', // Local
      'lh3.googleusercontent.com',
      'samara-api.appaa-cameroun.net',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.ngrok-free.dev',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '*.ngrok-free.dev',
        pathname: '/**',
      },
    ],
  },
  ...(process.env.APPLICATION_MODE === 'production' && {
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  }),
});
