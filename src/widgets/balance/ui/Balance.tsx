import { UserProfile, getMe } from '@/entities/user';
import styles from './Balance.module.scss';

// Простая функция для конвертации (замените на реальную логику)
const convertToRub = (usdtAmount: number): number => {
    // Пример: 1 USDT = 90 RUB
    const rate = 90;
    return usdtAmount * rate;
};

export const Balance = async () => {
    let user: UserProfile | null = null;
    let error: string | null = null;

    try {
        user = await getMe();
    } catch (err) {
        console.error('Ошибка при загрузке данных пользователя для баланса:', err);
        error = 'Не удалось загрузить баланс';
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
