// @/features/mining/ui/MachineList.tsx
import React from 'react';
import { MachineWithState, getAllMachines } from '@/entities/machine';
import { BuyMoreCard, MachineCard } from '@/widgets/machine-card';
import styles from './MachineList.module.scss';

// Пропсы: можем передать готовый список, или он загрузится внутри
interface MachineListProps {
    machines?: MachineWithState[];
    filterType?: 'purchased' | 'not_purchased' | 'all';
    showBuyMoreCard?: boolean;
}

export const MachineList: React.FC<MachineListProps> = async ({
    machines: propMachines,
    filterType = 'all',
    showBuyMoreCard = false,
}) => {
    let machinesWithState: MachineWithState[] = [];
    let error: string | null = null;

    // Если список передан через пропс — используем его
    if (propMachines) {
        machinesWithState = propMachines;
    } else {
        // Если не передан — загружаем самостоятельно (для страницы /shop)
        try {
            machinesWithState = await getAllMachines();
        } catch (err) {
            console.error('Ошибка при загрузке списка машин:', err);
            error = 'Не удалось загрузить список майнинг-машин';
        }
    }

    if (error) {
        return <div className={styles.machineListError}>{error}</div>;
    }

    // Фильтрация по типу (но для магазина будет 'all')
    const filteredMachines = machinesWithState.filter(({ state_car }) => {
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
