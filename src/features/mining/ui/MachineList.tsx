// @/features/mining/ui/MachineList.tsx
import { MachineCard } from '@/widgets/machine-card';
import { MACHINES } from '@/widgets/machine-card/model/machines';
import styles from './MachineList.module.scss';

export const MachineList = () => {
    return (
        <div className={styles.machineList}>
            {MACHINES.map((machine) => (
                <MachineCard
                    key={machine.id}
                    imageType={machine.imageType}
                    price={machine.price}
                    plateType={1}
                />
            ))}
        </div>
    );
};
