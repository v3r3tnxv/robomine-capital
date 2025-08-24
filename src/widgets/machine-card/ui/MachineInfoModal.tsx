// @/widgets/machine-card/ui/MachineInfoModal.tsx
import Image from 'next/image';
import { Modal } from '@/shared/ui';
import { MachineInfoModalProps } from '../model';
import styles from './MachineInfoModal.module.scss';

export const MachineInfoModal = ({ isOpen, onClose, machine }: MachineInfoModalProps) => {
    // --- Рассчитываем доход за активацию ---
    const earnings = Number(machine.car.daily_replenishment || 0);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.machineInfo}>
                <h2 className={styles.title}>
                    {machine.car.name || `Майнинг-машина #${machine.car.id}`}
                </h2>

                <div className={styles.imageContainer}>
                    <Image
                        src={`/images/${machine.car.image}`}
                        width={200}
                        height={200}
                        alt="Майнинг-машина"
                    />
                </div>

                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Цена:</span>
                        <span className={styles.value}>{machine.car.price} USDT</span>
                    </div>

                    <div className={styles.infoItem}>
                        <span className={styles.label}>Активации (срок службы):</span>
                        <span className={styles.value}>{machine.car.lifespan} дней</span>
                    </div>

                    <div className={styles.infoItem}>
                        <span className={styles.label}>Доход за 1 активацию:</span>
                        <span className={styles.value}>+{earnings} USDT</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
