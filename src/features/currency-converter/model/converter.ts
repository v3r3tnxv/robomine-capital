// @/features/currency-converter/model/converter.ts
import { ConvertCurrencyParams, CurrencyRates } from './types';

// Моковые курсы валют (в реальном приложении будут браться из API)
export const MOCK_RATES: CurrencyRates = {
    RUB: 1,
    USDT: 0.011, // 1 RUB = 0.011 USDT
};

export const convertCurrency = ({ amount, from, to, rates }: ConvertCurrencyParams): number => {
    if (from === to) return amount;

    // Конвертируем сначала в базовую валюту (RUB), затем в целевую
    const amountInBase = amount / rates[from];
    const result = amountInBase * rates[to];

    return Math.round(result * 100) / 100; // Округляем до 2 знаков после запятой
};
