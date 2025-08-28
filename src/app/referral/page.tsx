'use client';

// src/app/referral/page.tsx
import { useEffect, useState } from 'react';
import { UserReferralData, getUserReferrals } from '@/entities/user';
import { useUser } from '@/entities/user/model/UserContext';
import { BackButton, Button } from '@/shared/ui';
import { ReferralBalance } from '@/widgets/referral-balance';
import { ReferralLink } from '@/widgets/referral-link';
import { ReferralList } from '@/widgets/referral-list';
import styles from './Referral.module.scss';

export default function ReferralPage() {
    const { user } = useUser();
    const [referralsData, setReferralsData] = useState<UserReferralData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Загружаем данные рефералов только один раз, когда пользователь доступен
    useEffect(() => {
        if (user && !referralsData && loading === true && error === null) {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    setError(null);
                    const referralsDataResult = await getUserReferrals();
                    setReferralsData(referralsDataResult);
                } catch {
                    setError('Не удалось загрузить данные рефералов.');
                } finally {
                    setLoading(false); // Завершаем загрузку
                }
            };
            fetchData();
        }
    }, [user, referralsData, loading, error]);

    const handleInvite = () => {
        if (!user?.telegram_id) {
            // Можно показать уведомление пользователю
            return;
        }

        const referralLink = `https://t.me/RoboMine_CapitalBot?start=${user.telegram_id}`;
        const message = `Присоединяйся к RoboMine Capital и начни зарабатывать! 👉 ${referralLink}`;
        const telegramShareUrl = `&text=${encodeURIComponent(message)}`;
        window.open(telegramShareUrl, '_blank');
    };

    return (
        <div className={styles.referralPage}>
            <BackButton />
            <h1 className={styles.title}>Рефераллы</h1>

            <span className={styles.referralText}>Ваши рефералы уже заработали для вас:</span>
            <ReferralBalance />

            <span className={styles.referralText}>Ваша реферальная ссылка:</span>
            <ReferralLink telegramId={user?.telegram_id} />
            <Button className={styles.button} onClick={handleInvite}>
                Пригласить
            </Button>
            {referralsData && <ReferralList referrals={referralsData.referrals} />}
        </div>
    );
}
