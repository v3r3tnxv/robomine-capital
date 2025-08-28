// @/widgets/referral-card/ui/ReferralCard.tsx
import Image from 'next/image';
import { UserAttributes } from '@/entities/user/model/types';
import { Coin } from '@/shared/assets/icons';
import styles from './ReferralCard.module.scss';

// Пропсы для карточки реферала
interface ReferralCardProps {
    referral: Omit<UserAttributes, 'ban_until' | 'created_at' | 'updated_at'>;
}

export const ReferralCard = async ({ referral }: ReferralCardProps) => {
    const profit = (typeof referral.ref_balance === 'number' ? referral.ref_balance : parseFloat(referral.ref_balance as any) || 0).toFixed(2);

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
