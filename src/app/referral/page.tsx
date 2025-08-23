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
    const { user, isLoading: isUserLoading, error: userError } = useUser();
    const [referralsData, setReferralsData] = useState<UserReferralData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Загружаем данные рефералов только один раз, когда пользователь доступен
    useEffect(() => {
        // Если пользователь загружен и данные рефералов еще не загружены
        if (user && !referralsData && loading) {
            const fetchData = async () => {
                try {
                    setError(null);
                    const referralsDataResult = await getUserReferrals();
                    setReferralsData(referralsDataResult);
                } catch (err) {
                    console.error('Ошибка при загрузке данных рефералов (клиент):', err);
                    setError('Не удалось загрузить данные рефералов');
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        } else if (!user && !isUserLoading) {
            // Если пользователь не найден и загрузка завершена, останавливаем загрузку
            setLoading(false);
        }
    }, [user, isUserLoading, referralsData, loading]);

    // Обработка состояний загрузки
    if (isUserLoading || loading) {
        return <div className={styles.referralPage}>Загрузка данных...</div>;
    }

    // Обработка ошибок
    if (userError) {
        return <div className={styles.referralPage}>Ошибка пользователя: {userError}</div>;
    }

    if (error) {
        return <div className={styles.referralPage}>Ошибка: {error}</div>;
    }

    if (!user) {
        return <div className={styles.referralPage}>Пользователь не найден</div>;
    }

    // Преобразуем referrer_profit в число
    const referrerProfit = Number(user.referrer_profit);

    return (
        <div className={styles.referralPage}>
            <BackButton />
            <h1 className={styles.title}>Рефераллы</h1>

            <span className={styles.referralText}>Ваши рефералы уже заработали для вас:</span>
            <span className={styles.earningsAmount}>
                {isNaN(referrerProfit) ? '0.00' : referrerProfit} USDT
            </span>

            <span className={styles.referralText}>Ваша реферальная ссылка:</span>
            <ReferralLink telegramId={user.telegram_id} />
            <Button className={styles.button}>Пригласить</Button>
            {referralsData && <ReferralList referrals={referralsData.referrals} />}
        </div>
    );
}
