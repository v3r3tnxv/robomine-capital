
'use client';

import { useEffect, useState } from 'react';
import { getMe } from '@/entities/user/api/user.api'; // Убедитесь, что импортируете из правильного места
import { UserProfile } from '@/entities/user/model/types'; // Убедитесь, что импортируете тип
import styles from './Balance.module.scss';

// Простая функция для конвертации (замените на реальную логику)
const convertToRub = (usdtAmount: number): number => {
    // Пример: 1 USDT = 90 RUB
    const rate = 90;
    return usdtAmount * rate;
};

export const Balance = () => { // Убираем async
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Вызов API происходит на клиенте
                const userData = await getMe();
                setUser(userData);
            } catch (err) {
                console.error('Ошибка при загрузке данных пользователя для баланса (клиент):', err);
                setError('Не удалось загрузить баланс');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []); // Пустой массив зависимостей означает, что эффект запустится только один раз после монтирования

    if (loading) {
        return <div className={styles.balance}>Загрузка...</div>;
    }

    if (error) {
        return <div className={styles.balance}>{error}</div>;
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