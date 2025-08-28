// @/widgets/machine-card/ui/MachineInfoModal.tsx
import Image from 'next/image';
import { Coin } from '@/shared/assets/icons';
import { Modal } from '@/shared/ui';
import { MachineInfoModalProps } from '../model';
import styles from './MachineInfoModal.module.scss';

export const MachineInfoModal = ({ isOpen, onClose, machine }: MachineInfoModalProps) => {
    // --- Рассчитываем доход за активацию ---
    const earnings = Number(machine.car.daily_replenishment || 0);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.machineInfo}>
                <h2 className={styles.title}>{machine.car.name}</h2>

                <Image
                    src={`/images/${machine.car.image}`}
                    width={200}
                    height={200}
                    alt="Майнинг-машина"
                />

                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <p className={styles.label}>Цена:</p>
                        <p className={styles.value}>
                            {machine.car.price} <Coin width={20} height={20} />
                        </p>
                    </div>

                    <div className={styles.infoItem}>
                        <p className={styles.label}>Активации (срок службы):</p>
                        <p className={styles.value}>{machine.car.lifespan} дней</p>
                    </div>

                    <div className={styles.infoItem}>
                        <p className={styles.label}>Доход за 1 активацию:</p>
                        <p className={styles.value}>
                            +{earnings} <Coin width={20} height={20} />
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
