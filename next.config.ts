/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Установите нужный лимит, например, 10 МБ
    },
  },
};

module.exports = nextConfig;