/** @type {import('next').NextConfig} */
const nextConfig = {
    // Salida mínima para el contenedor de producción (VPS).
    output: 'standalone',

    // El generador del CV lee las fuentes Poppins y pdfkit lee sus propias
    // métricas (.afm) desde el disco, en tiempo de ejecución. El rastreo
    // automático de Next no ve esas lecturas, y la etapa de runtime del
    // Dockerfile sólo copia public/, .next/ y scripts/: sin esto el PDF
    // funciona en local y revienta en producción con ENOENT.
    outputFileTracingIncludes: {
        '/api/admin/perfiles/[id]/descargar': [
            './assets/fuentes/*.ttf',
            './node_modules/pdfkit/js/data/*.afm',
        ],
    },
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