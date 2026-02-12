
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Qadın Səsi - Hüquqi Yardım',
        short_name: 'Qadın Səsi',
        description: 'Hüquqi məsələlərdə sizə yol göstərmək üçün buradayıq',
        start_url: '/miniapp',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/icon-light-32x32.png',
                sizes: '32x32',
                type: 'image/png',
            },
            {
                src: '/icon-dark-32x32.png',
                sizes: '32x32',
                type: 'image/png',
            },
            {
                src: '/apple-icon.png',
                sizes: '192x192',
                type: 'image/png',
            },
        ],
    }
}
