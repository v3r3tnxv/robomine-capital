import Image from 'next/image';
import Link from 'next/link';
import { ActionButtons } from '@/widgets/action-buttons';
import { Header } from '@/widgets/header/ui/Header';
import styles from './Home.module.scss';

export default function HomePage() {
    return (
        <div className={styles.homePage}>
            <Header />
            <ActionButtons />

            <Link className={styles.shopLink} href={'/shop'}>
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
        </div>
    );
}
