import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enable React strict mode for improved error handling
  images: {
    domains: ['app.plex.tv'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV !== 'development', // Remove console.log in production
  },
  output: 'standalone',
};

export default withPWA({
  dest: 'public', // destination directory for the PWA files
  disable: process.env.NODE_ENV === 'development', // disable PWA in the development environment
  register: true, // register the PWA service worker
  skipWaiting: true, // skip waiting for service worker activation
})(nextConfig);
