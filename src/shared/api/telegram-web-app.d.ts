// types/telegram-web-app.d.ts
export {};

declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                initData: string;
                initDataUnsafe: {
                    user?: {
                        id: number;
                        first_name: string;
                        last_name?: string;
                        username?: string;
                        language_code: string;
                        is_premium?: boolean;
                    };
                    chat?: {
                        id: number;
                        type: string;
                        title?: string;
                        username?: string;
                    };
                    query_id: string;
                    auth_date: string;
                    hash: string;
                };
                ready: () => void;
                expand: () => void;
                close: () => void;
                // Добавьте другие методы и свойства, которые вы используете
            };
        };
    }
}
