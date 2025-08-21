// shared/api/axios.ts
import axios from 'axios';
import { API_URL } from '../config';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Добавляем перехватчик для запросов
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            try {
                // Проверяем наличие Telegram WebApp
                const telegramWebApp = window.Telegram?.WebApp;

                if (telegramWebApp) {
                    // Можем добавить любые нужные заголовки
                    // Например, Telegram user ID если нужно
                    if (telegramWebApp.initDataUnsafe?.user?.id) {
                        config.headers['X-Telegram-User-ID'] =
                            telegramWebApp.initDataUnsafe.user.id.toString();
                    }
                }
            } catch (error) {
                console.error('Error in Telegram WebApp interceptor:', error);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Перехватчик ответов для обработки ошибок аутентификации
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.log('Authentication failed');
        }
        return Promise.reject(error);
    }
);
