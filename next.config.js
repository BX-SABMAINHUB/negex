/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración existente (imágenes, webpack, etc.)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, { canvas: 'canvas', fabric: 'fabric' }];
    }
    return config;
  },

  // 🔐 Cabeceras de seguridad (aplicadas a todas las rutas)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Protección moderna contra clickjacking (frame-ancestors)
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://negex.vercel.app",
          },
          // Protección clásica (para navegadores antiguos)
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Evita que el navegador "adivine" el tipo de contenido
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Habilita el filtro XSS del navegador
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Controla la información enviada en el Referer
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Obliga a usar HTTPS durante un tiempo (recomendado en producción)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Controla qué APIs del navegador pueden usarse (ajusta según necesites)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
