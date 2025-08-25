// app/layout.tsx
import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import '@/shared/styles/global.scss';
import { AppProviders } from '../shared/lib/providers';
import styles from './layout.module.scss';

// Подключаем шрифт Lato
const latoSans = Lato({
    weight: ['100', '300', '400', '700', '900'],
    variable: '--font-lato',
    subsets: ['latin', 'latin-ext'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'Robomine capital',
        template: '%s | Robomine capital',
    },
    description: 'Зарабатывай на майнинге криптовалюты',
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <head>
                <script src="https://telegram.org/js/telegram-web-app.js" async></script>
            </head>
            <body className={`${styles.layout} ${latoSans.variable} `}>
                <main className={styles.content}>
                    <AppProviders>{children}</AppProviders>
                </main>
            </body>
        </html>
    );
}
