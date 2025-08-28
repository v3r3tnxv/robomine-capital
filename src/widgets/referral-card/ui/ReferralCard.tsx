// @/widgets/referral-card/ui/ReferralCard.tsx
import Image from 'next/image';
import { UserAttributes } from '@/entities/user/model/types';
import { Coin } from '@/shared/assets/icons';
import styles from './ReferralCard.module.scss';

// Пропсы для карточки реферала
interface ReferralCardProps {
    referral: Omit<UserAttributes, 'ban_until' | 'created_at' | 'updated_at'>;
}

export const ReferralCard = ({ referral }: ReferralCardProps) => {
    // Получаем значение ref_balance, которое может быть number, string, null или undefined
    const refBalanceValue = referral.ref_balance;

    // Преобразуем значение в число
    let numericProfit: number;
    if (typeof refBalanceValue === 'number') {
        numericProfit = refBalanceValue;
    } else if (typeof refBalanceValue === 'string') {
        // Пробуем преобразовать строку в число
        numericProfit = parseFloat(refBalanceValue);
        // Если parseFloat вернул NaN, заменяем на 0
        if (isNaN(numericProfit)) {
            numericProfit = 0;
        }
    } else {
        // Если null, undefined или другой тип, используем 0
        numericProfit = 0;
    }

    // Форматируем число до 2 знаков после запятой
    const profit = numericProfit.toFixed(2);

    return (
        <div className={styles.card}>
            <Image
                className={styles.avatar}
                src={`/images/mascot.webp`}
                width={100}
                height={100}
                alt={`Аватар ${referral.username}`}
            />
            <span className={styles.username}>{referral.username}</span>
            <span className={styles.profit}>
                +{profit} <Coin width={20} height={20} />
            </span>
        </div>
    );
};
