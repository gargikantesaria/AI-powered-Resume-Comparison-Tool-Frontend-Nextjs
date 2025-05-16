/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    loader: 'custom',
    loaderFile: './image-loader.ts',
  },
  trailingSlash: true,
};

module.exports = nextConfig;
