// shared/api/axios.ts
import axios from 'axios';
import { API_URL } from '@/shared/config/env';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Перехватчик запросов
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            // Убеждаемся, что код выполняется на клиенте
            // Проверяем, локальная ли разработка
            const isLocalDev =
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1';

            if (isLocalDev) {
                // --- Используем моковый initData для локальной разработки ---
                console.log('Режим локальной разработки: Отправка мокового X-Telegram-Init-Data');
                config.headers['X-Telegram-Init-Data'] = process.env.NEXT_PUBLIC_MOCK_INIT_DATA;
            } else {
                // Нормальный режим: пытаемся получить и отправить настоящий initData из Telegram Web App
                try {
                    // @ts-expect-error - свойство initData существует в Telegram WebApp, но отсутствует в типах
                    const initData = window.Telegram?.WebApp?.initData;
                    if (initData) {
                        config.headers['X-Telegram-Init-Data'] = initData;
                    }
                } catch (e) {
                    console.error('Ошибка при получении initData:', e);
                }
            }
        }
        return config;
    },

    // ... (остальные перехватчики, если есть)
    (error) => {
        return Promise.reject(error);
    }
);
