'use client';

import { memo } from 'react';
import clsx from 'clsx';
import styles from './ProgressBar.module.scss';

interface ProgressBarProps {
    progress: number;
    className?: string;
}

export const ProgressBar = memo(({ progress, className }: ProgressBarProps) => {
    return (
        <div className={clsx(styles.progressBar, className)}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
    );
});

ProgressBar.displayName = 'ProgressBar';
