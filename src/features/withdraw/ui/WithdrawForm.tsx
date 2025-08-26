'use client';

// @/features/deposit/ui/WithdrawForm.tsx
import { useEffect, useState } from 'react';
import { TransferResult, transfer } from '@/entities/withdrawal';
import { convertCurrency, useCurrencyConverter } from '@/features/currency-converter';
import { Button, Input } from '@/shared/ui';
import styles from './WithdrawForm.module.scss';

export const WithdrawForm = () => {
    const [rubAmount, setRubAmount] = useState('');
    const [usdtAmount, setUsdtAmount] = useState('');
    const [lastChanged, setLastChanged] = useState<'RUB' | 'USDT'>('RUB');
    const { rates } = useCurrencyConverter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Эффект для конвертации USDT <-> RUB для отображения
    useEffect(() => {
        // Если поле очищено, очищаем и второе поле
        if (lastChanged === 'RUB') {
            if (!rubAmount) {
                // Если RUB очищен, очищаем USDT
                setUsdtAmount('');
            } else if (!isNaN(Number(rubAmount)) && rates) {
                // <-- Проверяем rates на null
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
            } else if (!isNaN(Number(usdtAmount)) && rates) {
                // <-- Проверяем rates на null
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
        if (isValidNumericInput(sanitizedValue)) {
            setUsdtAmount(sanitizedValue);
            setLastChanged('USDT');
            setError('');
        }
        // Если ввод недопустим, мы его игнорируем, не обновляя состояние
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Предотвращаем перезагрузку страницы

        // Базовая валидация: проверяем, что сумма в USDT введена и положительна
        if (!usdtAmount || Number(usdtAmount) <= 0) {
            setError('Введите корректную сумму');
            return;
        }

        const amountToWithdraw = parseFloat(usdtAmount);

        setIsLoading(true);
        setError('');

        try {
            console.log(`Инициация вывода ${amountToWithdraw} USDT (эквивалент ~${rubAmount} RUB)`);

            const withdrawalResult: TransferResult = await transfer({ amount: usdtAmount });

            console.log('Результат вывода:', withdrawalResult);

            if (withdrawalResult.status === 'completed') {
                // Очищаем поля ввода
                setRubAmount('');
                setUsdtAmount('');
            } else {
                // Этот случай маловероятен, если auto_approve=true, но оставим на всякий
            }
        } catch (err: unknown) {
            console.error('Ошибка при выводе:', err);
            let errorMessage = 'Ошибка при попытке вывода. Попробуйте позже.';

            if (err instanceof Error) {
                // Пытаемся извлечь сообщение об ошибке от бэкенда
                const axiosLikeError = err as { response?: { data?: { error?: string } } };
                if (axiosLikeError.response?.data?.error) {
                    errorMessage = `Ошибка: ${axiosLikeError.response.data.error}`;
                } else {
                    errorMessage = `Ошибка: ${err.message}`;
                }
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Проверяем, можно ли активировать кнопку
    // Разрешаем отправку, если введена корректная сумма в USDT
    const isButtonDisabled =
        !usdtAmount || isNaN(parseFloat(usdtAmount)) || parseFloat(usdtAmount) <= 0 || isLoading;

    return (
        <form className={styles.withdrawForm} onSubmit={handleSubmit}>
            <Input
                type="tel"
                inputMode="decimal"
                pattern="[0-9]+([\.][0-9]+)?"
                variant="balance"
                placeholder="Введите сумму"
                value={rubAmount}
                onChange={(e) => handleRubChange(e.target.value)}
                currency="RUB"
                // error={error} // Ошибки обычно привязаны к основному полю действия или отдельному сообщению
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
                error={error} // Отображаем ошибки на основном поле ввода (USDT)
            />

            <Button className={styles.button} type="submit" disabled={isButtonDisabled}>
                {isLoading ? 'Обработка...' : 'Вывести'}
            </Button>
        </form>
    );
};
