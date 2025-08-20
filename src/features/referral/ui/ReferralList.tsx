// @/features/referral/ui/ReferralList.tsx
import { UserAttributes } from '@/entities/user';
import { ReferralCard } from '@/widgets/referral-card';
import styles from './ReferralList.module.scss';

// Пропсы для списка рефералов
interface ReferralListProps {
    referrals: Omit<UserAttributes, 'ban_until' | 'created_at' | 'updated_at'>[];
}

export const ReferralList = async ({ referrals }: ReferralListProps) => {
    // Если список пуст, можно отобразить сообщение
    if (referrals.length === 0) {
        return <p className={styles.emptyList}>У вас пока нет рефералов.</p>;
    }

    return (
        <div className={styles.referralList}>
            {referrals.map((referral) => (
                // Передаем данные конкретного реферала в карточку
                <ReferralCard
                    key={referral.telegram_id} // Используем уникальный ID
                    referral={referral}
                />
            ))}
        </div>
    );
};
