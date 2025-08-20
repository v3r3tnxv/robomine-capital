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
            // Если в Telegram Web App
            if (window.Telegram?.WebApp) {
                config.headers['X-Telegram-Init-Data'] = window.Telegram.WebApp.initData;
            }
            // Если локальная разработка (например, NEXT_PUBLIC_TELEGRAM_ID есть)
            else if (process.env.NEXT_PUBLIC_TELEGRAM_ID) {
                // Создаем фиктивную initData строку
                const telegramId = process.env.NEXT_PUBLIC_TELEGRAM_ID;
                // Минимально необходимая строка для прохождения валидации
                // В реальности она содержит больше данных, но для тестов этого достаточно
                const mockInitData = `user=%7B%22id%22%3A${telegramId}%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22testuser%22%7D&chat=%7B%22id%22%3A${telegramId}%7D&auth_date=1700000000&hash=mock_hash`;
                config.headers['X-Telegram-Init-Data'] = mockInitData;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
