// @/widgets/referral-card/ui/ReferralCard.tsx
import Image from 'next/image';
import { UserAttributes } from '@/entities/user/model/types';
import styles from './ReferralCard.module.scss';

// Пропсы для карточки реферала
interface ReferralCardProps {
    referral: Omit<UserAttributes, 'ban_until' | 'created_at' | 'updated_at'>;
}

export const ReferralCard = async ({ referral }: ReferralCardProps) => {
    // Простой способ получить "прибыль" реферала - можно адаптировать под вашу логику
    // Например, использовать referral.ref_balance или другое поле
    const profit = referral.ref_balance || 0;

    return (
        <div className={styles.card}>
            {/* TODO: Заменить на аватар реферала, если он есть */}
            <Image
                className={styles.avatar}
                src={`/images/machine1.png`} // Заглушка
                width={100}
                height={100}
                alt={`Аватар ${referral.username}`}
            />
            <span className={styles.username}>
                {referral.username || `Пользователь ${referral.telegram_id}`}
            </span>
            <span className={styles.profit}>+{profit.toFixed(2)} USDT</span>
        </div>
    );
};
