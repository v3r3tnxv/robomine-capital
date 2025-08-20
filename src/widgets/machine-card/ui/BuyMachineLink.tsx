// @/widgets/machine-card/ui/BuyMoreCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import styles from './BuyMachineLink.module.scss';

export const BuyMachineLink = () => {
    return (
        <Link className={styles.shopLink} href="/shop">
            <div className={styles.imageWrapper}>
                <Image
                    src="/images/robot.png"
                    width={100}
                    height={100}
                    alt="Робот"
                    className={styles.robotImage}
                />
            </div>
            <span className={styles.label}>Купить майнинг-машину</span>
        </Link>
    );
};
