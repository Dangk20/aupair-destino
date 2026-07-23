/** @type {import('next').NextConfig} */
const nextConfig = {
    // Salida mínima para el contenedor de producción (VPS).
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'raw.githubusercontent.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'flagcdn.com',
                pathname: '**',
            },
        ],
        unoptimized: true,
    },
};

export default nextConfig;