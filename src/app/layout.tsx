// app/layout.tsx
import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import '@/shared/styles/global.scss';
import styles from './layout.module.scss';
import { MachineProvider } from '@/shared/lib/contexts/MachineContext';
import { UserInitializer } from '@/widgets/user-initializer/ui/UserInitializer';

// Подключаем шрифт Lato
const latoSans = Lato({
    weight: ['100', '300', '400', '700', '900'],
    variable: '--font-lato',
    subsets: ['latin', 'latin-ext'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: '121 Games',
        template: '%s | 121 Games', // Для дочерних страниц
    },
    description: 'Play and win',
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
                    <MachineProvider>
                        <UserInitializer>
                            {children}
                        </UserInitializer>
                    </MachineProvider>
                </main>
            </body>
        </html>
    );
}
