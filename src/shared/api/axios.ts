// src/shared/api/axios.ts
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
            // Безопасно получаем Telegram WebApp
            const telegramWebApp = (
                window as unknown as {
                    Telegram?: {
                        WebApp?: {
                            initData: string;
                            [key: string]: unknown;
                        };
                    };
                }
            ).Telegram?.WebApp;

            if (telegramWebApp && telegramWebApp.initData) {
                config.headers['X-Telegram-Init-Data'] = telegramWebApp.initData;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
