// @/widgets/machine-card/ui/ReferralList.tsx
import { ReferralCard } from '@/widgets/referral-card';
import styles from './ReferralList.module.scss';

export const ReferralList = () => {
    return (
        <div className={styles.referralList}>
            <ReferralCard />
            <ReferralCard />
            <ReferralCard />
            <ReferralCard />
        </div>
    );
};
