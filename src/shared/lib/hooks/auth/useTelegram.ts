// src/shared/lib/hooks/auth/useTelegram.ts
import { useEffect, useState } from 'react';

interface WebAppUser {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    language_code?: string;
    is_premium?: boolean;
}

export const useTelegram = () => {
    const [user, setUser] = useState<WebAppUser | null>(null);
    const [initData, setInitData] = useState<string>('');
    const [telegramId, setTelegramId] = useState<number | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Безопасно получаем Telegram WebApp
            const telegramWebApp = (
                window as unknown as {
                    Telegram?: {
                        WebApp?: {
                            initData: string;
                            initDataUnsafe: {
                                user?: WebAppUser;
                                [key: string]: unknown;
                            };
                            ready: () => void;
                            expand: () => void;
                            [key: string]: unknown;
                        };
                    };
                }
            ).Telegram?.WebApp;

            if (telegramWebApp) {
                // Настройки Telegram Web App
                if (typeof telegramWebApp.ready === 'function') {
                    telegramWebApp.ready();
                }
                if (typeof telegramWebApp.expand === 'function') {
                    telegramWebApp.expand();
                }

                // Получаем данные
                const currentInitData = telegramWebApp.initData || '';
                const currentUser = telegramWebApp.initDataUnsafe?.user || null;
                const currentTelegramId = currentUser?.id || null;

                setInitData(currentInitData);
                setUser(currentUser);
                setTelegramId(currentTelegramId);
                setIsAuthenticated(!!currentTelegramId);
                setIsLoading(false);
            } else {
                // Не в Telegram Web App
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, []);

    return {
        user,
        initData,
        telegramId,
        isAuthenticated,
        isLoading,
    };
};
