// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/v1/:path*',
                destination: 'https://robomine.ru/api/v1/:path*',
            },
        ];
    },
};

export default nextConfig;
