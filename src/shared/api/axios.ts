// shared/api/axios.ts
import axios from 'axios';
import { API_URL } from '../config/env';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Добавляем перехватчик для запросов
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            try {
                const telegramWebApp = window.Telegram?.WebApp;

                if (telegramWebApp) {
                    // Проверяем, есть ли данные пользователя
                    if (telegramWebApp.initDataUnsafe?.user?.id) {
                        // Можем добавить ID пользователя в заголовки
                        config.headers['X-Telegram-User-ID'] =
                            telegramWebApp.initDataUnsafe.user.id.toString();
                    }

                    // Если бэкенд ожидает специфический заголовок,
                    // замените на правильное имя заголовка и значение
                    // config.headers['X-Telegram-Init-Data'] = 'значение';
                }
            } catch (error) {
                console.error('Error accessing Telegram WebApp data:', error);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
