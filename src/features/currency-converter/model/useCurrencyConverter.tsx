'use client';

// src/features/currency-converter/model/hooks.ts
import { useEffect, useState } from 'react';
import { CurrencyRates } from './types';

export const useCurrencyConverter = () => {
    const [rates, setRates] = useState<CurrencyRates | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRates = async () => {
            setLoading(true);
            setError(null);
            try {
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
                    setRates(fetchedRates);
                } else {
                    throw new Error('Не удалось получить корректный курс USDT/RUB.');
                }
            } catch (err) {
                if (err instanceof Error) {
                    console.error('Ошибка в useCurrencyConverter:', err);
                    setError(err.message || 'Ошибка загрузки курса USDT/RUB.');
                } else {
                    console.error('Неизвестная ошибка:', err);
                    setError('Неизвестная ошибка при загрузке курса.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRates();
    }, []);

    return { rates, loading, error };
};
