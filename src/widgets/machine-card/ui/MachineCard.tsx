'use client';

// @/widgets/machine-card/ui/MachineCard.tsx
import { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { MachineCardProps } from '../model/types';
import styles from './MachineCard.module.scss';
import { MachineInfoModal } from './MachineInfoModal';

export const MachineCard = ({
    plateType,
    imageType,
    price,
    id = 1,
    name,
    description,
    earningsPerDay,
}: MachineCardProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Ограничиваем типы plate значениями от 1 до 4
    const validPlateType = Math.max(1, Math.min(4, plateType || 1)); // Добавил значение по умолчанию

    // Ограничиваем типы изображений значениями от 1 до 8
    const validImageType = Math.max(1, Math.min(8, imageType || 1)); // Добавил значение по умолчанию

    const handleCardClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Устанавливаем значение по умолчанию для price
    const validPrice = price || 0;

    return (
        <>
            <button
                className={styles.card}
                onClick={handleCardClick}
                type="button"
                aria-label={`Посмотреть информацию о майнинг-машине за ${validPrice} USDT`}
            >
                <div className={clsx(styles.plate, styles[`plate${validPlateType}`])} />

                <Image
                    className={styles.image}
                    src={`/images/machine${validImageType}.png`}
                    width={100}
                    height={100}
                    alt="Майнинг-машина"
                />

                <span className={styles.activationInfo}>{validPrice} USDT</span>

                <span className={styles.button}>
                    <span className={styles.label}>Купить</span>
                </span>
            </button>

            <MachineInfoModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                machine={{
                    id,
                    imageType: validImageType,
                    price: validPrice, // Используем валидное значение
                    name,
                    description,
                    earningsPerDay,
                }}
            />
        </>
    );
};
