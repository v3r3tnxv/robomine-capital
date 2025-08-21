export {};

interface TelegramWebAppUser {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    language_code?: string;
    is_premium?: boolean;
}

interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
        user?: TelegramWebAppUser;
        [key: string]: unknown;
    };
    ready: () => void;
    expand: () => void;
    [key: string]: unknown;
}

declare global {
    interface Window {
        Telegram?: {
            WebApp?: TelegramWebApp;
        };
    }
}
