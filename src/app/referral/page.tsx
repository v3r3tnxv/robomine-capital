'use client';

// src/app/referral/page.tsx
import { useState } from 'react';
import { useReferrals } from '@/shared/lib/contexts';
import { useUser } from '@/shared/lib/contexts/UserContext';
import { BackButton, Button } from '@/shared/ui';
import { ReferralBalance } from '@/widgets/referral-balance';
import { ReferralLink } from '@/widgets/referral-link';
import { ReferralList } from '@/widgets/referral-list';
import styles from './Referral.module.scss';

export default function ReferralPage() {
    const { user } = useUser();
    const { referralsData } = useReferrals();

    const handleInvite = () => {
        if (!user?.telegram_id) {
            return;
        }

        const referralLink = `https://t.me/RoboMine_CapitalBot?start=${user.telegram_id}`;
        const message = `Присоединяйся к RoboMine Capital и начни зарабатывать!`;
        const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`;
        window.open(telegramShareUrl, '_blank');
    };

    return (
        <div className={styles.referralPage}>
            <BackButton />
            <h1 className={styles.title}>Рефераллы</h1>

            <p className={styles.referralText}>Ваши рефералы уже заработали для вас:</p>
            <ReferralBalance />

            <p className={styles.referralText}>Ваша реферальная ссылка:</p>
            <ReferralLink telegramId={user?.telegram_id} />
            <Button className={styles.button} onClick={handleInvite}>
                Пригласить
            </Button>
            {referralsData && <ReferralList referrals={referralsData.referrals} />}
        </div>
    );
}
