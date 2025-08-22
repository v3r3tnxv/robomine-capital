
'use client'; 
// @/app/referral/page.tsx
import { useEffect, useState } from 'react'; // <-- Импортируйте хуки
import { UserProfile, UserReferralData, getMe, getUserReferrals } from '@/entities/user';
import { ReferralList } from '@/features/referral';
import { BackButton, Button } from '@/shared/ui';
import { ReferralLink } from '@/widgets/referral-link';
import styles from './Referral.module.scss';

export default function ReferralPage() { // <-- Уберите async
    // Состояния для управления данными и состоянием загрузки
    const [user, setUser] = useState<UserProfile | null>(null);
    const [referralsData, setReferralsData] = useState<UserReferralData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Эффект для загрузки данных
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                // Получаем данные текущего пользователя
                const userData = await getMe();
                // Получаем данные рефералов
                const referralsDataResult = await getUserReferrals();

                setUser(userData);
                setReferralsData(referralsDataResult);
            } catch (err) {
                console.error('Ошибка при загрузке данных рефералов (клиент):', err);
                setError('Не удалось загрузить данные рефералов');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Пустой массив зависимостей означает, что эффект запустится только один раз после монтирования

    // Отображение состояния загрузки
    if (loading) {
        return (
            <div className={styles.referralPage}>
                <BackButton />
                <h1 className={styles.title}>Рефераллы</h1>
                <p className={styles.loading}>Загрузка...</p>
            </div>
        );
    }

    // Отображение ошибки
    if (error) {
        return (
            <div className={styles.referralPage}>
                <BackButton />
                <h1 className={styles.title}>Рефераллы</h1>
                <p className={styles.error}>{error}</p>
            </div>
        );
    }

    // Проверка наличия данных
    if (!user || !referralsData) {
        return (
            <div className={styles.referralPage}>
                <BackButton />
                <h1 className={styles.title}>Рефераллы</h1>
                <p className={styles.error}>Данные не найдены</p>
            </div>
        );
    }

    // Преобразуем referrer_profit в число
    const referrerProfit = Number(user.referrer_profit);

    // Проверяем, что это корректное число
    if (isNaN(referrerProfit)) {
        console.warn('referrer_profit не является числом:', user.referrer_profit);
    }

    return (
        <div className={styles.referralPage}>
            <BackButton />
            <h1 className={styles.title}>Рефераллы</h1>

            <span className={styles.referralText}>Ваши рефералы уже заработали для вас:</span>
            <span className={styles.earningsAmount}>
                {isNaN(referrerProfit) ? '0.00' : referrerProfit.toFixed(2)} USDT
            </span>

            <span className={styles.referralText}>Ваша реферальная ссылка:</span>
            <ReferralLink telegramId={user.telegram_id} />
            <Button className={styles.button}>Пригласить</Button>
            <ReferralList referrals={referralsData.referrals} />
        </div>
    );
}