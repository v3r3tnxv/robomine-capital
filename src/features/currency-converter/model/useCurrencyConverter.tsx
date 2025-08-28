'use client';

// src/features/currency-converter/model/useCurrencyConverter.tsx
import { useEffect, useState } from 'react';
import { CurrencyRates } from './types';

const CACHE_KEY = 'currencyConverterRates';
// Установите желаемое время кэширования (например, 15 минут = 15 * 60 * 1000 миллисекунд)
const CACHE_DURATION_MS = 15 * 60 * 1000;

export const useCurrencyConverter = () => {
    const [rates, setRates] = useState<CurrencyRates | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchRates = async () => {
            setLoading(true);
            setError(null);

            try {
                // 1. Попытка получить данные из localStorage
                if (typeof window !== 'undefined') {
                    const cachedDataString = localStorage.getItem(CACHE_KEY);
                    if (cachedDataString) {
                        const cachedData = JSON.parse(cachedDataString);
                        const now = Date.now();
                        // Проверяем, не истекло ли время кэша
                        if (now - cachedData.timestamp < CACHE_DURATION_MS) {
                            console.log('Использованы кэшированные курсы валют');
                            if (isMounted) {
                                setRates(cachedData.rates);
                                setLoading(false);
                            }
                            return; // Используем кэш, запрос не нужен
                        } else {
                            console.log('Кэш курсов валют устарел');
                        }
                    }
                }

                // 2. Если кэша нет или он устарел, делаем запрос к API
                console.log('Запрос курсов валют к API...');
                const response = await fetch(
                    'https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=rub'
                );

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                const usdtToRubRate = data?.tether?.rub;

                if (typeof usdtToRubRate === 'number' && usdtToRubRate > 0) {
                    const fetchedRates: CurrencyRates = {
                        RUB: 1,
                        USDT: 1 / usdtToRubRate,
                    };

                    // 3. Сохраняем полученные данные в localStorage с меткой времени
                    if (typeof window !== 'undefined') {
                        const cachePayload = {
                            rates: fetchedRates,
                            timestamp: Date.now(),
                        };
                        localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
                        console.log('Курсы валют сохранены в localStorage');
                    }

                    if (isMounted) {
                        setRates(fetchedRates);
                    }
                } else {
                    throw new Error('Не удалось получить корректный курс USDT/RUB.');
                }
            } catch (err) {
                console.error('Ошибка в useCurrencyConverter:', err);
                if (isMounted) {
                    if (err instanceof Error) {
                        setError(err.message || 'Ошибка загрузки курса USDT/RUB.');
                    } else {
                        setError('Неизвестная ошибка при загрузке курса.');
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchRates();

        return () => {
            isMounted = false;
        };
    }, []); // Пустой массив зависимостей - запуск только при монтировании

    return { rates, loading, error };
};
