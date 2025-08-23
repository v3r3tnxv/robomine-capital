'use client';

// @/features/mining/ui/MachineList.tsx
import React from 'react';
import { MachineWithState } from '@/entities/machine';
import { useMachines } from '@/shared/lib/contexts/MachineContext';
import { BuyMoreCard, MachineCard } from '@/widgets/machine-card';
import styles from './MachineList.module.scss';

interface MachineListProps {
    machines?: MachineWithState[];
    filterType: 'purchased' | 'not_purchased' | 'all';
    showBuyMoreCard?: boolean;
}

export const MachineList: React.FC<MachineListProps> = ({
    machines: propMachines,
    filterType = 'all',
    showBuyMoreCard = false,
}) => {
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
            {shouldShowBuyMore && <BuyMoreCard />}
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
