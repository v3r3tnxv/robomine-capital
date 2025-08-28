'use client';

// @/features/mining/ui/MachineList.tsx
import React from 'react';
import Link from 'next/link';
import { useMachines } from '@/shared/lib/contexts/MachineContext';
import { MachineCard } from '@/widgets/machine-card';
import { MachineListProps } from '../model';
import styles from './MachineList.module.scss';

export const MachineList = ({
    machines: propMachines,
    filterType = 'all',
    showBuyMoreCard = false,
}: MachineListProps) => {
    // Используем контекст если machines не переданы
    const { machines: contextMachines } = useMachines();

    // Используем переданные машины или машины из контекста
    const machinesToUse = propMachines || contextMachines;

    // Фильтрация по типу
    const filteredMachines = machinesToUse.filter(({ state_car }) => {
        const status = state_car?.status ?? 'not_purchased';
        switch (filterType) {
            case 'purchased':
                return status !== 'not_purchased';
            case 'not_purchased':
                return status === 'not_purchased';
            case 'all':
            default:
                return true;
        }
    });

    const shouldShowBuyMore = showBuyMoreCard && filterType === 'purchased';

    return (
        <div className={styles.machineList}>
            {shouldShowBuyMore && (
                <Link href="/shop" className={styles.buyMoreCard}>
                    <div className={styles.plate} />
                    <span className={styles.add}>+</span>
                    <span className={styles.label}>Купить ещё</span>
                </Link>
            )}

            {filteredMachines.map((machineWithState) => {
                const { car, state_car } = machineWithState;
                const status = state_car?.status ?? 'not_purchased';
                const isPurchased = status !== 'not_purchased';

                return (
                    <MachineCard
                        key={car.id}
                        image={car.image}
                        price={car.price}
                        status={status}
                        isPurchased={isPurchased}
                        machineData={machineWithState}
                    />
                );
            })}
        </div>
    );
};
