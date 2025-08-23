'use client';

// src/shared/ui/loading-indicator/LoadingIndicator.tsx
import styles from './LoadingIndicator.module.scss';

export const LoadingIndicator = ({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) => {
    return (
        <div className={`${styles.loader} ${styles[size]}`}>
            <div className={styles.spinner}></div>
        </div>
    );
};
