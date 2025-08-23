// @/shared/ui/referral-link/ReferralLink.tsx
import { Copy } from '@/shared/assets/icons';
import { Input } from '@/shared/ui';
import styles from './ReferralLink.module.scss';

interface ReferralLinkProps {
    telegramId?: number;
}

export const ReferralLink = ({ telegramId }: ReferralLinkProps) => {
    const referralLink = `https://t.me/RoboMine_CapitalBot?start=${telegramId}`;

    const handleCopy = async () => {
        navigator.clipboard.writeText(referralLink).then(() => {});
    };

    return (
        <div className={styles.referralLinkWrapper}>
            <button
                className={styles.referralLink}
                onClick={handleCopy}
                type="button"
                aria-label={''}
            >
                <Input
                    className={styles.input}
                    type="text"
                    variant="default"
                    placeholder="Реферальная ссылка"
                    value={referralLink}
                    readOnly
                />

                <Copy className={styles.copyIcon} />
            </button>
        </div>
    );
};
