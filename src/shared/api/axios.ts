import axios from 'axios';
import { API_URL } from '../config';

export const api = axios.create({
    baseURL: API_URL,
});

// Добавляем перехватчик для запросов
api.interceptors.request.use(
    (config) => {
        // Проверяем, что мы в браузере
        if (typeof window !== 'undefined') {
            try {
                const telegramWebApp = window.Telegram?.WebApp;

                if (telegramWebApp && telegramWebApp.initData) {
                    config.headers['X-Telegram-Init-Data'] = telegramWebApp.initData;
                }
            } catch (error) {
                console.error('Error getting Telegram initData:', error);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
