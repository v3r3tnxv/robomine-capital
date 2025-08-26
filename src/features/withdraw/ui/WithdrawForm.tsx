'use client';

// @/features/deposit/ui/WithdrawForm.tsx
import { useEffect, useState } from 'react';
import { useUser } from '@/entities/user/model/UserContext';
import { TransferResult, transfer } from '@/entities/withdrawal';
import { convertCurrency, useCurrencyConverter } from '@/features/currency-converter';
import { Button, Input } from '@/shared/ui';
import styles from './WithdrawForm.module.scss';

export const WithdrawForm = () => {
    const [rubAmount, setRubAmount] = useState('');
    const [usdtAmount, setUsdtAmount] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [lastChanged, setLastChanged] = useState<'RUB' | 'USDT'>('RUB');
    const { rates } = useCurrencyConverter();
    const { user } = useUser();

    // Обновляем одно поле в зависимости от другого
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
                    rates, // <-- Теперь rates гарантированно не null в этом блоке
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
                    rates, // <-- Теперь rates гарантированно не null в этом блоке
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
            if (message) setMessage(null);
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
            if (message) setMessage(null);
        }
        // Если ввод недопустим, мы его игнорируем, не обновляя состояние
    };

    const handleSubmit = async () => {
        if (!rubAmount || Number(rubAmount) <= 0) {
            setError('Введите корректную сумму');
            return;
        }

        const amountToWithdraw = parseFloat(usdtAmount);

        // Проверка баланса пользователя (в USDT, предполагая, что user.balance в USDT)
        const userBalance = user?.balance ?? 0;
        if (amountToWithdraw > userBalance) {
            setError('Недостаточно средств на балансе');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage(null);

        try {
            console.log(`Инициация вывода ${amountToWithdraw}`);

            // Вызываем API-функцию для перевода, передавая сумму в USDT
            const withdrawalResult: TransferResult = await transfer({ amount: usdtAmount });

            console.log('Результат вывода:', withdrawalResult);

            // Показываем сообщение пользователю
            if (withdrawalResult.status === 'completed') {
                setMessage({ type: 'success', text: `Вывод успешно выполнен!` });
                // Очищаем поля ввода
                setRubAmount('');
                setUsdtAmount('');
            } else if (withdrawalResult.status === 'pending_confirmation') {
                setMessage({
                    type: 'success',
                    text: `Заявка на вывод создана и ожидает подтверждения.`,
                });
                // Очищаем поля ввода
                setRubAmount('');
                setUsdtAmount('');
            } else {
                setMessage({
                    type: 'success',
                    text: `Вывод инициирован со статусом: ${withdrawalResult.status}`,
                });
                // Очищаем поля ввода
                setRubAmount('');
                setUsdtAmount('');
            }
        } catch (err: unknown) {
            console.error('Ошибка при создании инвойса:', err);
            let errorMessage = 'Ошибка при попытке пополнения. Попробуйте позже.';
            if (err instanceof Error) {
                const axiosLikeError = err as { response?: { data?: { error?: string } } };
                if (axiosLikeError.response?.data?.error) {
                    errorMessage = `Ошибка: ${axiosLikeError.response.data.error}`;
                } else {
                    errorMessage = `Ошибка: ${err.message}`;
                }
            }

            setError(errorMessage);
        }
    };

    // Проверяем, можно ли активировать кнопку
    const isButtonDisabled = !usdtAmount || Number(usdtAmount) <= 0 || isLoading;

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

            {message && (
                <p className={`${styles.message} ${styles[message.type]}`}>{message.text}</p>
            )}

            <Button className={styles.button} onClick={handleSubmit} disabled={isButtonDisabled}>
                {isLoading ? 'Обработка...' : 'Вывести'}
            </Button>
        </div>
    );
};
