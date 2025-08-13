'use client';

// @/features/deposit/ui/DepositForm.tsx
import { useEffect, useState } from 'react';
import { convertCurrency, useCurrencyConverter } from '@/features/currency-converter';
import { Button, Input } from '@/shared/ui';
import styles from './DepositForm.module.scss';

export const DepositForm = () => {
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

    const handleRubChange = (value: string) => {
        setRubAmount(value);
        setLastChanged('RUB');
        setError('');
    };

    const handleUsdtChange = (value: string) => {
        setUsdtAmount(value);
        setLastChanged('USDT');
        setError('');
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
        <div className={styles.depositForm}>
            <Input
                type="tel"
                variant="balance"
                placeholder="Введите сумму"
                value={rubAmount}
                onChange={(e) => handleRubChange(e.target.value)}
                currency="RUB"
                error={error}
            />

            <Input
                type="tel"
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
