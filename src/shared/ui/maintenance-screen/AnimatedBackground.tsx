'use client';

// src/shared/ui/MaintenanceScreen/AnimatedBackground.tsx
import React, { memo } from 'react';
import styles from './MaintenanceScreen.module.scss';

export const AnimatedBackground = memo(() => {
    return (
        <div className={styles.animatedBackground}>
            {[...Array(20)].map((_, i) => (
                <div
                    key={i} // key={i} по-прежнему нужен для React при рендеринге списков
                    className={styles.floatingElement}
                    style={{
                        top: -38,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${10 + Math.random() * 10}s`,
                    }}
                >
                    {/* Исправлена ошибка: Math.floor(Math.random() * 5), а не 15, так как в массиве 5 элементов (индексы 0-4) */}
                    {['⛏️', '⚡', '💻', '🔧', '⚙️'][Math.floor(Math.random() * 5)]}
                </div>
            ))}
        </div>
    );
});

AnimatedBackground.displayName = 'AnimatedBackground';
