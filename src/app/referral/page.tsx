// @/app/referral/page.tsx (или как у вас называется страница рефералов)
import { UserProfile, UserReferralData, getMe, getUserReferrals } from '@/entities/user';
import { ReferralList } from '@/features/referral';
import { BackButton, Button } from '@/shared/ui';
import { ReferralLink } from '@/widgets/referral-link';
import styles from './Referral.module.scss';

export default async function ReferralPage() {
    let user: UserProfile | null = null;
    let referralsData: UserReferralData | null = null;
    let error: string | null = null;

    try {
        // Получаем данные текущего пользователя
        user = await getMe();
        // Получаем данные рефералов
        referralsData = await getUserReferrals();
    } catch (err) {
        console.error('Ошибка при загрузке данных рефералов:', err);
        error = 'Не удалось загрузить данные рефералов';
    }

    if (error) {
        return (
            <div className={styles.referralPage}>
                <BackButton />
                <h1 className={styles.title}>Рефераллы</h1>
                <p className={styles.error}>{error}</p>
            </div>
        );
    }

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
