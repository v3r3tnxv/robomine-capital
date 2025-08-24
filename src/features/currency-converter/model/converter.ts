// src/features/currency-converter/model/converter.ts
import { ConvertCurrencyParams } from './types';

export const convertCurrency = ({ amount, from, to, rates }: ConvertCurrencyParams): number => {
    // 1. Если конвертируем валюту в саму себя, возвращаем исходную сумму
    if (from === to) {
        return amount;
    }

    // 2. Проверяем, существуют ли курсы для обеих валют
    //    и передан ли сам объект rates
    if (!rates || rates[from] === undefined || rates[to] === undefined) {
        console.warn(`Курс для валюты ${from} или ${to} не найден в переданных rates.`, {
            rates,
            from,
            to,
        });
        // Можно бросить ошибку или вернуть 0
        return 0;
        // throw new Error(`Курс для валюты ${from} или ${to} не найден.`);
    }

    // 3. --- Логика конвертации ---
    // Предположение: `rates` содержит курсы относительно базовой валюты RUB.
    // `rates['USDT']` означает, сколько RUB эквивалентно 1 единице USDT.
    // Например: rates = { RUB: 1, USDT: 0.011 }
    // Это значит: 1 RUB = 0.011 USDT, или 1 USDT = 1 / 0.011 ≈ 90.91 RUB

    // Чтобы конвертировать `amount` из `from` в `to`:
    // a. Сначала находим, сколько базовой валюты (RUB) эквивалентно `amount` валюты `from`.
    //    amountInRub = amount * (1 / rates[from])
    //    (Потому что rates[from] говорит, сколько RUB в 1 единице валюты from)
    //    Пример: amount = 10 USDT, rates['USDT'] = 0.011
    //    amountInRub = 10 * (1 / 0.011) = 10 * 90.91 ≈ 909.09 RUB

    // b. Затем конвертируем эту сумму из базовой валюты (RUB) в целевую валюту `to`.
    //    result = amountInRub * rates[to]
    //    (Потому что rates[to] говорит, сколько RUB эквивалентно 1 единице валюты to)
    //    Пример: amountInRub = 909.09 RUB, rates['RUB'] = 1
    //    result = 909.09 * 1 = 909.09 RUB (если to = 'RUB')
    //    Если бы to = 'EUR' и rates['EUR'] = 0.0095 (1 RUB = 0.0095 EUR)
    //    result = 909.09 * 0.0095 ≈ 8.64 EUR

    // Объединяя шаги a и b:
    // result = (amount * (1 / rates[from])) * rates[to]
    // result = (amount * rates[to]) / rates[from]

    const result = (amount * rates[to]) / rates[from];

    // 4. Округляем результат до разумного количества знаков после запятой.
    // Для финансовых расчетов часто достаточно 2-8 знаков.
    // Предположим, 6 знаков после запятой подходит для криптовалют.
    // Math.round(result * 1_000_000) / 1_000_000 эквивалентно округлению до 6 знаков.
    // Альтернатива: parseFloat(result.toFixed(6))
    return Math.round(result * 1_000_000) / 1_000_000;
    // Или, если хотите всегда 3 знака (как в Balance):
    // return parseFloat(result.toFixed(3));
};
