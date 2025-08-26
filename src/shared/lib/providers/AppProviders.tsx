'use client';

// app/appProviders.tsx
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from '@/entities/user';
// import { SplashScreen } from '@/shared/ui';
import { MachineProvider } from '../contexts/MachineContext';

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
                <MachineProvider>{children}</MachineProvider>
            </UserProvider>
        </QueryClientProvider>
    );
}
