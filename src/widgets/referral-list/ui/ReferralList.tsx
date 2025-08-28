'use client';

// @/features/referral/ui/ReferralList.tsx
import { UserAttributes } from '@/entities/user';
import { ReferralCard } from '@/widgets/referral-card';
import styles from './ReferralList.module.scss';

interface ReferralListProps {
    referrals: Omit<UserAttributes, 'ban_until' | 'created_at' | 'updated_at'>[];
}

export const ReferralList = ({ referrals }: ReferralListProps) => {
    if (referrals.length === 0) {
        return <p className={styles.emptyList}>У вас пока нет рефералов.</p>;
    }

    return (
        <div className={styles.referralList}>
            {referrals.map((referral) => (
                <ReferralCard key={referral.telegram_id} referral={referral} />
            ))}
        </div>
    );
};
