'use client';

// src/shared/ui/splash-screen/SplashScreen.tsx
import Image from 'next/image';
import { ProgressBar } from '../progres-bar';
import styles from './SplashScreen.module.scss';

export default function SplashScreen() {
    return (
        <div className={styles.splashSceen}>
            <Image
                src="/images/loading-scrine.png"
                width={100}
                height={100}
                alt="Робот"
                className={styles.background}
            />
            <p className={styles.label}>Загрузка</p>
            <ProgressBar progress={10} />
        </div>
    );
}
