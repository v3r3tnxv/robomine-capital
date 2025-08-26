'use client';

// @/features/deposit/ui/WithdrawForm.tsx
import { useEffect, useState } from 'react';
import { useUser } from '@/entities/user/model/UserContext';
// import { TransferResult, transfer } from '@/entities/withdrawal'; // Убираем импорт transfer, если он вызывает ошибку TS2339
import { convertCurrency, useCurrencyConverter } from '@/features/currency-converter';
import { Button, Input } from '@/shared/ui';
import styles from './WithdrawForm.module.scss';

// --- Добавляем определение типа локально, если импорт не работает ---
// Или импортируйте из правильного места
type TransferResult = {
    id: number;
    telegram_id: number;
    hash: string;
    amount: number;
    status: 'pending' | 'pending_confirmation' | 'completed' | 'rejected';
    created_at: string;
    updated_at: string;
    // ... другие поля, если есть
};
// --- Конец добавления типа ---

// --- Добавляем локальную функцию API, если импорт не работает ---
// Или импортируйте из правильного места
const transfer = async (data: { amount: string }): Promise<TransferResult> => {
    const response = await fetch('/api/v1/withdrawal/transfer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Не забудьте добавить заголовок авторизации, если он требуется
            // 'X-Telegram-Init-Data': window.Telegram?.WebApp?.initData || '',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
};
// --- Конец добавления функции API ---

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
        if (lastChanged === 'RUB') {
            if (!rubAmount) {
                setUsdtAmount('');
            } else if (!isNaN(Number(rubAmount)) && rates) {
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
                setRubAmount('');
            } else if (!isNaN(Number(usdtAmount)) && rates) {
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
        return /^(\d+\.?\d*|\.\d+)?$/.test(value);
    };

    const handleRubChange = (value: string) => {
        const sanitizedValue = value.replace(/[^0-9.]/g, '');
        if (isValidNumericInput(sanitizedValue)) {
            setRubAmount(sanitizedValue);
            setLastChanged('RUB');
            setError('');
            if (message) setMessage(null);
        }
    };

    const handleUsdtChange = (value: string) => {
        const sanitizedValue = value.replace(/[^0-9.]/g, '');
        if (isValidNumericInput(sanitizedValue)) {
            setUsdtAmount(sanitizedValue);
            setLastChanged('USDT');
            setError('');
            if (message) setMessage(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Предотвращаем перезагрузку страницы

        // Базовая валидация: проверяем, что сумма в USDT введена и положительна
        if (!usdtAmount || isNaN(parseFloat(usdtAmount)) || parseFloat(usdtAmount) <= 0) {
            setError('Введите корректную сумму в USDT для вывода.');
            return;
        }

        const amountToWithdraw = parseFloat(usdtAmount);

        setIsLoading(true);
        setError('');
        setMessage(null);

        try {
            console.log(`Инициация вывода ${amountToWithdraw} USDT (эквивалент ~${rubAmount} RUB)`);

            // Вызываем API-функцию для перевода
            const withdrawalResult: TransferResult = await transfer({ amount: usdtAmount });

            console.log('Результат вывода:', withdrawalResult);

            // Показываем сообщение пользователю в зависимости от статуса
            if (withdrawalResult.status === 'completed') {
                setMessage({ type: 'success', text: `Вывод успешно выполнен!` });
            } else if (withdrawalResult.status === 'pending_confirmation') {
                setMessage({
                    type: 'success',
                    text: `Заявка на вывод создана и ожидает подтверждения.`,
                });
            } else {
                // Для статусов 'pending' или других
                setMessage({
                    type: 'success',
                    text: `Вывод инициирован со статусом: ${withdrawalResult.status}`,
                });
            }

            // Очищаем поля ввода после успешной отправки запроса (не обязательно)
            // setRubAmount('');
            // setUsdtAmount('');
        } catch (err: unknown) {
            console.error('Ошибка при выводе:', err);
            let errorMessage = 'Ошибка при попытке вывода. Попробуйте позже.';

            if (err instanceof Error) {
                // Пытаемся извлечь сообщение об ошибке от бэкенда
                try {
                    // Если err.message уже содержит JSON от API
                    const parsedError = JSON.parse(err.message);
                    if (parsedError.error) {
                        errorMessage = `Ошибка: ${parsedError.error}`;
                    } else {
                        errorMessage = `Ошибка: ${err.message}`;
                    }
                } catch (parseErr) {
                    // Если не JSON, используем сообщение как есть
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
        <div className={styles.withdrawForm}>
            {/* Оборачиваем в форму для правильной семантики и обработки onSubmit */}
            <form onSubmit={handleSubmit}>
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

                {/* Отображение сообщений об успехе или ошибке */}
                {message && (
                    <p className={`${styles.message} ${styles[message.type]}`}>{message.text}</p>
                )}

                <Button
                    className={styles.button}
                    type="submit" // Убедитесь, что кнопка имеет тип submit
                    disabled={isButtonDisabled}
                >
                    {isLoading ? 'Обработка...' : 'Вывести'}
                </Button>
            </form>
        </div>
    );
};
