// shared/lib/hooks/useTelegramWebApp.ts
import { useEffect, useState } from 'react';

interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
}

declare global {
    interface Window {
        Telegram?: {
            WebApp: {
                initDataUnsafe: {
                    user?: TelegramUser;
                };
                ready: () => void;
            };
        };
    }
}

export const useTelegramWebApp = () => {
    const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            const user = window.Telegram.WebApp.initDataUnsafe.user || null;
            setTgUser(user);
            setIsLoading(false);
            window.Telegram.WebApp.ready();
        } else {
            setIsLoading(false);
        }
    }, []);

    return { tgUser, isLoading };
};
