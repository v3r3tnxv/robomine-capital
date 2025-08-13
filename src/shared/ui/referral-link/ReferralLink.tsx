'use client';

// @/shared/ui/referral-link/ReferralLink.tsx
import { Copy } from '@/shared/assets/icons';
import { Input } from '../input';
import styles from './ReferralLink.module.scss';

export const ReferralLink = () => {
    const handleCopy = () => {
        navigator.clipboard.writeText('t.me/@krot_bot&?start=asvbvbbd');
    };

    return (
        <div className={styles.referralLinkWrapper}>
            <button
                className={styles.referralLink}
                onClick={handleCopy}
                aria-label="Копировать реферальную ссылку"
                type="button"
            >
                <Input
                    className={styles.input}
                    type="text"
                    variant="default"
                    placeholder="Введите сумму"
                    value="t.me/@krot_bot&?start=asvbvbbd"
                    readOnly
                />
                <Copy className={styles.copyIcon} />
            </button>
        </div>
    );
};
