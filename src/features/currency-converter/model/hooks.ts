// @/features/currency-converter/model/hooks.ts
import { useEffect, useState } from 'react';
import { MOCK_RATES } from './converter';
import { CurrencyRates } from './types';

export const useCurrencyConverter = () => {
    const [rates] = useState<CurrencyRates>(MOCK_RATES);

    // В реальном приложении здесь будет fetch к API с курсами валют
    useEffect(() => {
        // Пример получения курсов из API
        // const fetchRates = async () => {
        //     const response = await fetch('/api/rates');
        //     const data = await response.json();
        //     setRates(data);
        // };
        // fetchRates();
    }, []);

    return { rates };
};
