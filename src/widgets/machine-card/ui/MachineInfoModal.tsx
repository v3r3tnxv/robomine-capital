'use client';

// @/widgets/machine-card/ui/MachineInfoModal.tsx
import Image from 'next/image';
import { Modal } from '@/shared/ui';
import styles from './MachineInfoModal.module.scss';

interface MachineInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBuy?: () => void;
    machine: {
        id: number;
        imageType: number;
        price: number;
        name?: string;
        description?: string;
        earningsPerDay?: number;
    };
}

export const MachineInfoModal = ({ isOpen, onClose, onBuy, machine }: MachineInfoModalProps) => {
    // Вычисляем доход в 0.05% от цены
    const calculateEarnings = (price: number): number => {
        return (price * 0.05) / 100; // 0.05%
    };

    const earnings = calculateEarnings(machine.price);

    const handleBuy = () => {
        if (onBuy) {
            onBuy();
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.machineInfo}>
                <h2 className={styles.title}>{machine.name || `Майнинг-машина #${machine.id}`}</h2>

                <div className={styles.imageContainer}>
                    <Image
                        src={`/images/machine${machine.imageType}.png`}
                        width={200}
                        height={200}
                        alt="Майнинг-машина"
                    />
                </div>

                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Цена:</span>
                        <span className={styles.value}>{machine.price} USDT</span>
                    </div>

                    <div className={styles.infoItem}>
                        <span className={styles.label}>Доход (0.05%):</span>
                        <span className={styles.value}>{earnings.toFixed(2)} USDT</span>
                    </div>

                    <div className={styles.infoItem}>
                        <span className={styles.label}>Активации:</span>
                        <span className={styles.value}>30</span>
                    </div>

                    {machine.earningsPerDay && (
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Доход в день:</span>
                            <span className={styles.value}>+{machine.earningsPerDay} USDT</span>
                        </div>
                    )}

                    {machine.description && (
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Описание:</span>
                            <span className={styles.value}>{machine.description}</span>
                        </div>
                    )}
                </div>

                <button className={styles.buyButton} onClick={handleBuy}>
                    Купить за {machine.price} USDT
                </button>
            </div>
        </Modal>
    );
};
