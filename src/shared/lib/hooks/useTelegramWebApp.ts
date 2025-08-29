// shared/lib/hooks/useTelegramWebApp.ts
import { useEffect, useState } from 'react';

interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
}

// Объявляем глобальный тип для Telegram WebApp
declare global {
    interface Window {
        Telegram?: {
            WebApp: {
                initDataUnsafe: {
                    user?: TelegramUser;
                    start_param?: string;
                };
                initData?: string; // Для проверки в других частях приложения, если нужно
                disableVerticalSwipes: () => void;
                ready: () => void;
                expand: () => void;
                platform?: string;
            };
        };
    }
}

export const useTelegramWebApp = () => {
    const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Проверяем, локальная ли разработка
        const isLocalhost =
            typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

        if (isLocalhost) {
            console.log('LOCALHOST detected in useTelegramWebApp');

            // Используем фиксированный ID для локальной разработки
            // Убедитесь, что этот ID соответствует пользователю в вашей БД
            // и совпадает с ID, используемым в NEXT_PUBLIC_MOCK_INIT_DATA на бэкенде
            const MOCK_TELEGRAM_USER_ID = 912131238; // Ваш ID

            const mockUser: TelegramUser = {
                id: MOCK_TELEGRAM_USER_ID,
                first_name: 'Александр', // Имя из вашего initData
                last_name: '', // Фамилия из вашего initData
                username: 'v3r3tnxv', // Username из вашего initData
                language_code: 'ru', // Язык из вашего initData
                // Добавьте другие поля, если они используются в вашем приложении
                // photo_url: 'https://t.me/i/userpic/320/....svg' // Из вашего initData
            };

            console.log('Setting mock tgUser:', mockUser);
            setTgUser(mockUser);
            setIsLoading(false);
            return;
        }

        // Логика для production (внутри Telegram Web App)
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            // Получаем данные пользователя из Telegram Web App
            const user = window.Telegram.WebApp.initDataUnsafe?.user || null;
            setTgUser(user);
            setIsLoading(false);

            // обработка ref_id
            try {
                // Получаем start параметр из initData
                const initData = window.Telegram.WebApp.initData || '';
                const initDataParams = new URLSearchParams(initData);
                const startParam = initDataParams.get('start');

                if (startParam) {
                    localStorage.setItem('referrer_id', startParam);
                    console.log('Saved referrer_id from start param:', startParam);
                }
            } catch (e) {
                console.warn('Error parsing start parameter:', e);
            }

            // Раскрываем приложение на весь экран
            try {
                window.Telegram.WebApp.disableVerticalSwipes();
                window.Telegram.WebApp.expand();
                window.Telegram.WebApp.ready();
            } catch (e) {
                console.warn('Error expanding Telegram WebApp:', e);
            }
        } else {
            setTgUser(null);
            setIsLoading(false);
        }
    }, []); // Пустой массив зависимостей - запускается только при монтировании

    return { tgUser, isLoading };
};
