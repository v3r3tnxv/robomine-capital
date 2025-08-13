// @/widgets/machine-card/ui/MachineCard.tsx
import Image from 'next/image';
import styles from './ReferralCard.module.scss';

export const ReferralCard = () => {
    return (
        <div className={styles.card}>
            <Image
                className={styles.avatar}
                src={`/images/machine1.png`}
                width={100}
                height={100}
                alt="User avatar"
            />
            <span className={styles.username}>Агент Александр</span>
            <span className={styles.profit}>+1200 USDT</span>
        </div>
    );
};
