'use client';

// @/features/deposit/ui/DepositForm.tsx
import { useEffect, useState } from 'react';
import { DepositDto, createDepositInvoice } from '@/entities/deposit';
import { convertCurrency, useCurrencyConverter } from '@/features/currency-converter';
import { useUser } from '@/shared/lib/contexts';
import { Button, Input } from '@/shared/ui';
import styles from './DepositForm.module.scss';

export const DepositForm = () => {
    const [rubAmount, setRubAmount] = useState('');
    const [usdtAmount, setUsdtAmount] = useState('');
    const [lastChanged, setLastChanged] = useState<'RUB' | 'USDT'>('USDT');
    const { rates } = useCurrencyConverter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { refreshUserBalance } = useUser();

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

    // Обработчики изменений полей ввода
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Предотвращаем перезагрузку страницы

        // Основная проверка по полю USDT
        if (!usdtAmount || Number(usdtAmount) <= 0) {
            setError('Введите корректную сумму');
            return;
        }

        const assetToUse = 'USDT'; // Актив для оплаты
        const amountToUse = usdtAmount; // Сумма в USDT

        setIsLoading(true);
        setError('');

        try {
            console.log(`Создание инвойса для ${assetToUse}:`, amountToUse);
            // Вызываем API-функцию
            // Предполагаем, что бэкенд (DepositService) был изменен для возврата pay_url
            const invoiceData: DepositDto & { pay_url?: string } = await createDepositInvoice(
                assetToUse,
                amountToUse
            );

            console.log('Данные инвойса от бэкенда:', invoiceData);

            let payUrl: string | null = null;

            // Проверяем, есть ли pay_url в ответе
            if (invoiceData.pay_url) {
                payUrl = invoiceData.pay_url;
            } else if (invoiceData.invoice_id) {
                // Если нет, пробуем сформировать его (проверьте правильность формата!)
                // Формат может отличаться, уточните в документации CryptoBot
                payUrl = `https://t.me/CryptoBot?start=IV${invoiceData.invoice_id}`;
                console.warn(
                    'pay_url не найден в ответе бэкенда, формируем вручную. Проверьте формат.'
                );
            }

            if (payUrl) {
                try {
                    await refreshUserBalance();
                } catch (refreshError) {
                    console.error(
                        'Не удалось обновить баланс после создания инвойса:',
                        refreshError
                    );
                    setError('Ошибка получения ссылки на оплату. Обратитесь в поддержку.');
                }
                console.log('Перенаправление на:', payUrl);
                window.location.href = payUrl;
            } else {
                setError('Ошибка получения ссылки на оплату. Обратитесь в поддержку.');
                console.error(
                    'Не удалось получить или сформировать pay_url из ответа:',
                    invoiceData
                );
            }
        } catch (err: unknown) {
            console.error('Ошибка при создании инвойса:', err);
            let errorMessage = 'Ошибка при попытке пополнения. Попробуйте позже.';

            if (err instanceof Error) {
                // Пытаемся извлечь сообщение об ошибке от бэкенда
                const axiosLikeError = err as { response?: { data?: { error?: string } } };
                if (axiosLikeError.response?.data?.error) {
                    errorMessage = `Ошибка: ${axiosLikeError.response.data.error}`;
                } else {
                    errorMessage = `Ошибка: ${err.message}`;
                }
            }
            // Если ошибка не является экземпляром Error, используем общее сообщение
            setError(errorMessage);
        }
    };

    // Проверяем, можно ли активировать кнопку
    const isButtonDisabled = !usdtAmount || Number(usdtAmount) <= 0;

    return (
        <form className={styles.depositForm} onSubmit={handleSubmit}>
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

            <Button className={styles.button} type="submit" disabled={isButtonDisabled}>
                {isLoading ? 'Обработка...' : 'Пополнить'}
            </Button>
        </form>
    );
};
