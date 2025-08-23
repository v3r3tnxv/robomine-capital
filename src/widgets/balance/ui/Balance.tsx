'use client';

// src/widgets/balance/ui/Balance.tsx
import { useUser } from '@/entities/user/model/UserContext';
import styles from './Balance.module.scss';

// Простая функция для конвертации (замените на реальную логику)
const convertToRub = (usdtAmount: number): number => {
    // Пример: 1 USDT = 90 RUB
    const rate = 90;
    return usdtAmount * rate;
};

export const Balance = () => {
    const { user } = useUser();

    const balanceRub = convertToRub(Number(user?.balance));

    return (
        <div className={styles.balance}>
            <span className={styles.balanceConvert}>{balanceRub} RUB</span>
            <span className={styles.balanceMain}>{Number(user?.balance)} USDT</span>
        </div>
    );
};
