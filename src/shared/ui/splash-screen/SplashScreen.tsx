'use client';

// src/shared/ui/splash-screen/SplashScreen.tsx
import { useEffect, useState } from 'react';
import { ProgressBar } from '../progres-bar';
import styles from './SplashScreen.module.scss';

export function SplashScreen() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Общее время показа SplashScreen в миллисекундах
        const TOTAL_DURATION_MS = 500; // 3 секунды
        // Интервал обновления в миллисекундах
        const INTERVAL_TIME_MS = 5;

        // Рассчитываем, на сколько процентов увеличивать прогресс за каждый шаг
        // 100% / (TOTAL_DURATION_MS / INTERVAL_TIME_MS) = 100% / (3000 / 50) = 100% / 60 = 1.666...%
        const INCREMENT_PER_STEP = 100 / (TOTAL_DURATION_MS / INTERVAL_TIME_MS);

        const interval = setInterval(() => {
            setProgress((prevProgress) => {
                const newProgress = prevProgress + INCREMENT_PER_STEP;
                // Если прогресс достиг или превысил 100%, останавливаем интервал
                if (newProgress >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return newProgress;
            });
        }, INTERVAL_TIME_MS);

        // Функция очистки: очищаем интервал, когда компонент размонтируется
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.splashSceen}>
            <p className={styles.label}>Загрузка...</p>
            <ProgressBar className={styles.progressBar} progress={progress} />
        </div>
    );
}
