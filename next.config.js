/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
    // Augmenter les limites de taille pour les uploads vidéo (Server Actions)
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
}

module.exports = nextConfig
