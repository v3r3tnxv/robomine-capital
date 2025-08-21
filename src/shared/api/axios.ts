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
