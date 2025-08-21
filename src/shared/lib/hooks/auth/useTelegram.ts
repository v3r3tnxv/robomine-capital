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
        // Проверяем, что мы на клиенте
        if (typeof window === 'undefined') {
            setIsLoading(false);
            return;
        }

        let checkInterval: NodeJS.Timeout; // Объявляем переменную заранее

        const initTelegram = () => {
            try {
                const telegramWebApp = window.Telegram?.WebApp;

                if (telegramWebApp) {
                    // Инициализация Telegram WebApp
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

                    console.log('Telegram ID:', currentTelegramId);
                    console.log('User name:', currentUser?.first_name);
                    console.log('Username:', currentUser?.username);

                    setInitData(currentInitData);
                    setUser(currentUser);
                    setTelegramId(currentTelegramId);
                    setIsAuthenticated(!!currentTelegramId);
                    setIsLoading(false);
                } else {
                    console.warn('Telegram WebApp not available');
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error initializing Telegram WebApp:', error);
                setIsLoading(false);
            }
        };

        // Проверяем сразу, есть ли Telegram WebApp
        if (window.Telegram?.WebApp) {
            initTelegram();
        } else {
            // Если нет, ждем загрузки скрипта
            checkInterval = setInterval(() => {
                if (window.Telegram?.WebApp) {
                    clearInterval(checkInterval);
                    initTelegram();
                }
            }, 100);

            // Таймаут на случай, если скрипт не загрузился
            setTimeout(() => {
                clearInterval(checkInterval);
                setIsLoading(false);
            }, 2000);
        }

        // Очистка
        return () => {
            if (checkInterval) {
                clearInterval(checkInterval);
            }
        };
    }, []);

    return {
        user,
        initData,
        telegramId,
        isAuthenticated,
        isLoading,
    };
};
