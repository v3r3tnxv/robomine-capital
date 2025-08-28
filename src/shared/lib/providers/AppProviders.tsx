'use client';

// app/appProviders.tsx
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { SplashScreen } from '@/shared/ui';
import { MachineProvider, UserProvider } from '../contexts';
import { ReferralProvider } from '../contexts/ReferralContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                    },
                },
            })
    );

    // const [showSplash, setShowSplash] = useState(true);

    // // Эффект для установки таймера
    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setShowSplash(false); // Через 5 секунд скрываем сплеш
    //     }, 3000); // 5000 миллисекунд = 5 секунд

    //     // Очистка таймера при размонтировании (хорошая практика)
    //     return () => clearTimeout(timer);
    // }, []); // Пустой массив зависимостей - запускается только при монтировании

    // // Если showSplash true, рендерим только экран загрузки
    // if (showSplash) {
    //     return <SplashScreen />; // <-- Отображаем SplashScreen
    // }

    return (
        <QueryClientProvider client={queryClient}>
            <UserProvider>
                <ReferralProvider>
                    <MachineProvider>{children}</MachineProvider>
                </ReferralProvider>
            </UserProvider>
        </QueryClientProvider>
    );
}
