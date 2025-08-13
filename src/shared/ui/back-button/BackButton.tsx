'use client';

// @/shared/ui/back-button/BackButton.tsx
import { useRouter } from 'next/navigation';
import { Arrow } from '@/shared/assets/icons';
import styles from './BackButton.module.scss';

export const BackButton = () => {
    const router = useRouter();

    return (
        <button
            className={styles.backButton}
            onClick={() => router.back()}
            aria-label="Назад"
            type="button"
            title="Назад"
        >
            <Arrow className={styles.icon} />
        </button>
    );
};
