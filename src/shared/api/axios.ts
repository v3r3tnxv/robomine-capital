// shared/api/axios.ts
import axios from 'axios';
import { API_URL } from '@/shared/config/env';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Добавляем перехватчик для запросов
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            try {
                // @ts-expect-error - свойство initData существует в Telegram WebApp, но отсутствует в типах
                const initData = window.Telegram?.WebApp?.initData;

                // Проверяем, что initData не undefined и не null
                if (initData !== undefined && initData !== null) {
                    config.headers['X-Telegram-Init-Data'] = initData;
                } else {
                    // Альтернативный способ - из URL параметров
                    const urlParams = new URLSearchParams(window.location.search);
                    const tgWebAppData = urlParams.get('tgWebAppData');
                    if (tgWebAppData) {
                        config.headers['X-Telegram-Init-Data'] = tgWebAppData;
                    }
                }
            } catch (error) {
                console.error('Error processing Telegram WebApp data:', error);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
