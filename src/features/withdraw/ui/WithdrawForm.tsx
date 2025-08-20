'use client';

// @/features/deposit/ui/WithdrawForm.tsx
import { useEffect, useState } from 'react';
import { convertCurrency, useCurrencyConverter } from '@/features/currency-converter';
import { Button, Input } from '@/shared/ui';
import styles from './WithdrawForm.module.scss';

export const WithdrawForm = () => {
    const [rubAmount, setRubAmount] = useState('');
    const [usdtAmount, setUsdtAmount] = useState('');
    const [error, setError] = useState('');
    const [lastChanged, setLastChanged] = useState<'RUB' | 'USDT'>('RUB');
    const { rates } = useCurrencyConverter();

    // Обновляем одно поле в зависимости от другого
    useEffect(() => {
        // Если поле очищено, очищаем и второе поле
        if (lastChanged === 'RUB') {
            if (!rubAmount) {
                // Если RUB очищен, очищаем USDT
                setUsdtAmount('');
            } else if (!isNaN(Number(rubAmount))) {
                // Обновляем USDT на основе RUB
                const converted = convertCurrency({
                    amount: Number(rubAmount),
                    from: 'RUB',
                    to: 'USDT',
                    rates,
                });
                setUsdtAmount(converted.toString());
            }
        } else if (lastChanged === 'USDT') {
            if (!usdtAmount) {
                // Если USDT очищен, очищаем RUB
                setRubAmount('');
            } else if (!isNaN(Number(usdtAmount))) {
                // Обновляем RUB на основе USDT
                const converted = convertCurrency({
                    amount: Number(usdtAmount),
                    from: 'USDT',
                    to: 'RUB',
                    rates,
                });
                setRubAmount(converted.toString());
            }
        }
    }, [rubAmount, usdtAmount, lastChanged, rates]);

    const isValidNumericInput = (value: string): boolean => {
        // Разрешает пустую строку, положительные числа и десятичные дроби
        // ^\d*\.?\d*$ - регулярное выражение:
        // ^ - начало строки
        // \d* - ноль или более цифр
        // \.? - опциональная точка
        // \d* - ноль или более цифр после точки
        // $ - конец строки
        return /^(\d+\.?\d*|\.\d+)?$/.test(value);
    };

    const handleRubChange = (value: string) => {
        // Убираем все символы, кроме цифр и точки
        const sanitizedValue = value.replace(/[^0-9.]/g, '');

        // Проверяем, является ли ввод допустимым числом
        if (isValidNumericInput(sanitizedValue)) {
            setRubAmount(sanitizedValue);
            setLastChanged('RUB');
            setError('');
        }
        // Если ввод недопустим, мы его игнорируем, не обновляя состояние
    };

    const handleUsdtChange = (value: string) => {
        // Убираем все символы, кроме цифр и точки
        const sanitizedValue = value.replace(/[^0-9.]/g, '');

        // Проверяем, является ли ввод допустимым числом
        if (isValidNumericInput(sanitizedValue)) {
            setUsdtAmount(sanitizedValue);
            setLastChanged('USDT');
            setError('');
        }
        // Если ввод недопустим, мы его игнорируем, не обновляя состояние
    };

    const handleSubmit = () => {
        if (!rubAmount || Number(rubAmount) <= 0) {
            setError('Введите корректную сумму');
            return;
        }
        console.log('Пополнение RUB:', rubAmount);
        console.log('Эквивалент в USDT:', usdtAmount);

        // Очищаем форму после успешной отправки
        setRubAmount('');
        setUsdtAmount('');
    };

    // Проверяем, можно ли активировать кнопку
    const isButtonDisabled =
        !rubAmount || !usdtAmount || Number(rubAmount) <= 0 || Number(usdtAmount) <= 0;

    return (
        <div className={styles.withdrawForm}>
            <Input
                type="tel"
                inputMode="decimal"
                pattern="[0-9]+([\.][0-9]+)?"
                variant="balance"
                placeholder="Введите сумму"
                value={rubAmount}
                onChange={(e) => handleRubChange(e.target.value)}
                currency="RUB"
                error={error}
            />

            <Input
                type="tel"
                inputMode="decimal"
                pattern="[0-9]+([\.][0-9]+)?"
                variant="balance"
                placeholder="Введите сумму"
                value={usdtAmount}
                onChange={(e) => handleUsdtChange(e.target.value)}
                currency="USDT"
                error={error}
            />

            <Button className={styles.button} onClick={handleSubmit} disabled={isButtonDisabled}>
                Пополнить
            </Button>
        </div>
    );
};
