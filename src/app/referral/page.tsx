import { ReferralList } from '@/features/referral';
import { BackButton, Button, ReferralLink } from '@/shared/ui';
import styles from './Referral.module.scss';

export default function ReferralPage() {
    return (
        <div className={styles.referralPage}>
            <BackButton />
            <h1 className={styles.title}>Рефераллы</h1>

            <span className={styles.referralText}>Ваши рефералы уже заработали для вас:</span>
            <span className={styles.earningsAmount}>999 USDT</span>

            <span className={styles.referralText}>Ваша реферальная ссылка:</span>
            <ReferralLink />
            <Button className={styles.button}>Пригласить</Button>
            <ReferralList />
        </div>
    );
}
