'use client';

// src/features/claim-animation/ui/ClaimAnimation.tsx
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Coin } from '@/shared/assets/icons';
import styles from './ClaimAnimation.module.scss';

export const ClaimAnimation = () => {
    const [shouldAnimateCoins, setShouldAnimateCoins] = useState(false);

    useEffect(() => {
        // Небольшая задержка для уверенности, что DOM готов для анимации
        const timer = setTimeout(() => {
            setShouldAnimateCoins(true);
        }, 10);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={styles.claimAnimation}>
            <Coin className={clsx(styles.coin, styles.coinCentral)} width={50} height={50} />

            <div
                className={clsx(styles.coin, styles.coinTopLeft, {
                    [styles.animate]: shouldAnimateCoins,
                })}
            >
                <Coin width={50} height={50} />
            </div>
            <div
                className={clsx(styles.coin, styles.coinTopRight, {
                    [styles.animate]: shouldAnimateCoins,
                })}
            >
                <Coin width={50} height={50} />
            </div>
            <div
                className={clsx(styles.coin, styles.coinBottomRight, {
                    [styles.animate]: shouldAnimateCoins,
                })}
            >
                <Coin width={50} height={50} />
            </div>
            <div
                className={clsx(styles.coin, styles.coinBottomLeft, {
                    [styles.animate]: shouldAnimateCoins,
                })}
            >
                <Coin width={50} height={50} />
            </div>
        </div>
    );
};
