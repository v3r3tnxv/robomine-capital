// @/widgets/machine-card/ui/BuyMoreCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import styles from './BuyMoreCard.module.scss';

export const BuyMoreCard = () => {
    return (
        <Link href="/shop" className={styles.buyMoreCard}>
            <div className={styles.plate} />
            <span className={styles.add}>+</span>
            <span className={styles.label}>Купить ещё</span>
        </Link>
    );
};
