/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');
const runtimeCaching = require('next-pwa/cache');

const withPWA = require('next-pwa')({
  disable: process.env.NODE_ENV === 'development',
  dest: 'public',
  runtimeCaching,
});

module.exports = withPWA({
  i18n,
  images: {
    domains: [
      'api.samara-shopping.com',
      'samara-api.appaa-cameroun.net',
      'localhost',
      '127.0.0.1',
      'googleusercontent.com',
      'maps.googleapis.com',
      'sAmArAapi.redq.io',
      'graph.facebook.com',
      'res.cloudinary.com',
      's3.amazonaws.com',
      '18.141.64.26',
      'via.placeholder.com',
      'pickbazarlaravel.s3.ap-southeast-1.amazonaws.com',
      'sAmArAlaravel.s3.ap-southeast-1.amazonaws.com',
      'picsum.photos',
      'cdninstagram.com',
      'scontent.cdninstagram.com',
      'chawkbazarlaravel.s3.ap-southeast-1.amazonaws.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'samara-api.appaa-cameroun.net',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'samara-api.appaa-cameroun.net',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'rockfish-outflank-skewed.ngrok-free.dev',
        pathname: '/**',
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
});
