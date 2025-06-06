/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 构建输出配置
  // distDir: 'out',
  // 如果需要静态导出，取消下面注释
  // output: 'export',
  // trailingSlash: true,
  // Vercel优化配置
  experimental: {
    serverComponentsExternalPackages: []
  }
}

export default nextConfig