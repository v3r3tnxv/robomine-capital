'use client';

// src/app/referral/page.tsx
import { useEffect, useState } from 'react';
import { UserReferralData, getUserReferrals } from '@/entities/user';
import { useUser } from '@/entities/user/model/UserContext';
import { BackButton, Button } from '@/shared/ui';
import { ReferralLink } from '@/widgets/referral-link';
import { ReferralList } from '@/widgets/referral-list';
import styles from './Referral.module.scss';

export default function ReferralPage() {
    const { user } = useUser();
    const [referralsData, setReferralsData] = useState<UserReferralData | null>(null);

    // Загружаем данные рефералов только один раз, когда пользователь доступен
    useEffect(() => {
        if (user && !referralsData) {
            const fetchData = async () => {
                try {
                    const referralsDataResult = await getUserReferrals();
                    setReferralsData(referralsDataResult);
                } catch (err) {
                    console.error('Ошибка при загрузке данных рефералов (клиент):', err);
                }
            };
            fetchData();
        }
    }, [user, referralsData]);

    const handleInvite = () => {
        const referralLink = `https://t.me/RoboMine_CapitalBot?start=${user!.telegram_id}`;
        const message = `Присоединяйся к RoboMine Capital и начни зарабатывать! 👉 ${referralLink}`;

        const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`;
        window.open(telegramShareUrl, '_blank');
    };

    return (
        <div className={styles.referralPage}>
            <BackButton />
            <h1 className={styles.title}>Рефераллы</h1>

            <span className={styles.referralText}>Ваши рефералы уже заработали для вас:</span>
            <span className={styles.earningsAmount}>{user!.referrer_profit} USDT</span>

            <span className={styles.referralText}>Ваша реферальная ссылка:</span>
            <ReferralLink telegramId={user!.telegram_id} />
            <Button className={styles.button} onClick={handleInvite}>
                Пригласить
            </Button>
            {referralsData && <ReferralList referrals={referralsData.referrals} />}
        </div>
    );
}
