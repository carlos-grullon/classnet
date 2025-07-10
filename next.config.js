/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com','testclassnetbucket.s3.us-east-2.amazonaws.com'],
  },
};

module.exports = nextConfig;
