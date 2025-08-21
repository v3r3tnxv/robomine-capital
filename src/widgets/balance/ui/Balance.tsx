'use client';

import { useEffect, useState } from 'react';
import { createUser } from '@/entities/user/api/user.api';
import { UserProfile } from '@/entities/user/model/types';
import { useTelegram } from '@/shared/lib/hooks/auth/useTelegram';
import styles from './Balance.module.scss';

// Простая функция для конвертации (замените на реальную логику)
const convertToRub = (usdtAmount: number): number => {
    // Пример: 1 USDT = 90 RUB
    const rate = 90;
    return usdtAmount * rate;
};

export const Balance = () => {
    const { user: telegramUser, initData, telegramId, isAuthenticated, isLoading } = useTelegram();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const createAndFetchUserData = async () => {
            if (!isAuthenticated || !telegramUser) {
                return;
            }

            try {
                console.log('Creating user for balance:', telegramUser);
                const userData = await createUser({
                    telegram_id: telegramUser.id,
                    username: telegramUser.username || '',
                    ref_id: 0, // по умолчанию
                    tokens: 0, // по умолчанию
                });
                setUser(userData);
            } catch (err) {
                console.error('Ошибка при создании пользователя для баланса:', err);
                setError('Не удалось создать пользователя');
            }
        };

        if (isAuthenticated && telegramUser) {
            createAndFetchUserData();
        }
    }, [isAuthenticated, telegramUser]);

    if (isLoading) {
        return <div className={styles.balance}>Загрузка...</div>;
    }

    if (error) {
        return <div className={styles.balance}>{error}</div>;
    }

    if (!isAuthenticated) {
        return <div className={styles.balance}>Пожалуйста, откройте это приложение в Telegram</div>;
    }

    if (!user) {
        return <div className={styles.balance}>Пользователь не найден</div>;
    }

    const balanceUsdt = Number(user.balance);
    const balanceRub = convertToRub(balanceUsdt);

    return (
        <div className={styles.balance}>
            <span className={styles.balanceConvert}>{balanceRub.toFixed(2)} RUB</span>
            <span className={styles.balanceMain}>{balanceUsdt.toFixed(2)} USDT</span>
        </div>
    );
};
