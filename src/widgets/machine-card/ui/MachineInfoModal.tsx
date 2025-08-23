'use client';

// @/widgets/machine-card/ui/MachineInfoModal.tsx
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { activateMachine, purchaseMachine, transitionMachine } from '@/entities/machine';
import { useMachines } from '@/shared/lib/contexts/MachineContext';
import { Button, Modal } from '@/shared/ui';
import { MachineInfoModalProps } from '../model';
import styles from './MachineInfoModal.module.scss';

export const MachineInfoModal = ({
    isOpen,
    onClose,
    onAction,
    machine,
    isPurchased,
    status,
}: MachineInfoModalProps) => {
    const { updateMachineStatusLocally } = useMachines();
    const [isProcessing, setIsProcessing] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [currentStatus, setCurrentStatus] = useState(status);

    // Синхронизируем статус с пропсами
    useEffect(() => {
        setCurrentStatus(status);
    }, [status]);

    // --- Рассчитываем доход за активацию ---
    const earnings = Number(machine.car.daily_replenishment || 0);

    // --- Обработчик покупки ---
    const handleBuy = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        setModalError(null);

        try {
            const success = await purchaseMachine({ car_id: machine.car.id });

            if (success) {
                console.log(`Машина ${machine.car.id} успешно куплена.`);

                // Локальное обновление без перезагрузки
                setCurrentStatus('awaiting');
                updateMachineStatusLocally(machine.car.id, 'awaiting');

                window.dispatchEvent(
                    new CustomEvent('machinePurchased', {
                        detail: { machineId: machine.car.id },
                    })
                );

                if (onAction) {
                    onAction('purchased', machine.car.id);
                }

                onClose();
            } else {
                throw new Error('Сервер сообщил о неудаче операции.');
            }
        } catch (err) {
            console.error('Ошибка при покупке машины:', err);
            let errorMessage = 'Произошла ошибка при покупке. Пожалуйста, попробуйте позже.';
            if (err instanceof Error) {
                if (err.message.includes('Insufficient funds')) {
                    errorMessage = 'Недостаточно средств на балансе.';
                }
            }
            setModalError(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    // --- Обработчик активации ---
    const handleActivate = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        setModalError(null);

        try {
            const result = await activateMachine({ car_id: machine.car.id });

            if (result) {
                console.log(`Машина ${machine.car.id} активирована.`);

                // Локальное обновление без перезагрузки
                const newStatus = 'in_progress';
                setCurrentStatus(newStatus);
                updateMachineStatusLocally(machine.car.id, newStatus);

                const lastUpdated = Math.floor(Date.now() / 1000);
                window.dispatchEvent(
                    new CustomEvent('machineActivated', {
                        detail: {
                            machineId: machine.car.id,
                            lastUpdated,
                        },
                    })
                );

                if (onAction) {
                    onAction('activated', machine.car.id);
                }
            }
        } catch (err) {
            console.error('Ошибка активации:', err);
            setModalError('Ошибка активации машины');
        } finally {
            setIsProcessing(false);
        }
    };

    // --- Обработчик получения награды ---
    const handleCollectReward = async () => {
        if (isProcessing || !machine.state_car?.id) return;

        setIsProcessing(true);
        setModalError(null);

        try {
            const result = await transitionMachine({ car_to_user_id: machine.state_car.id });

            if (result) {
                console.log(`Награда получена для машины ${machine.car.id}.`);

                // Определяем следующий статус
                const nextState = machine.state_car.remaining_uses > 1 ? 'awaiting' : 'completed';
                setCurrentStatus(nextState);
                updateMachineStatusLocally(machine.car.id, nextState);

                if (onAction) {
                    onAction('transitioned', machine.car.id);
                }
            }
        } catch (err) {
            console.error('Ошибка получения награды:', err);
            setModalError('Ошибка получения награды');
        } finally {
            setIsProcessing(false);
        }
    };

    // --- Получить текст для основной кнопки ---
    const getPrimaryButtonText = () => {
        if (!isPurchased) {
            return isProcessing ? 'Покупка...' : `Купить за ${machine.car.price} USDT`;
        }

        switch (currentStatus) {
            case 'awaiting':
                return isProcessing ? 'Активация...' : 'Активировать';
            case 'in_progress':
                return 'В работе...';
            case 'waiting_for_reward':
                return isProcessing ? 'Получение...' : 'Забрать награду';
            case 'completed':
                return 'Завершена';
            default:
                return 'Уже у вас';
        }
    };

    // --- Получить обработчик для основной кнопки ---
    const getPrimaryButtonHandler = () => {
        if (!isPurchased) {
            return handleBuy;
        }

        switch (currentStatus) {
            case 'awaiting':
                return handleActivate;
            case 'waiting_for_reward':
                return handleCollectReward;
            default:
                return undefined;
        }
    };

    const primaryButtonHandler = getPrimaryButtonHandler();
    const primaryButtonText = getPrimaryButtonText();
    const isPrimaryButtonDisabled =
        isProcessing || (!isPurchased && isProcessing) || (isPurchased && !primaryButtonHandler);

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

                    {/* --- Отображаем статус машины --- */}
                    {isPurchased && (
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Статус:</span>
                            <span className={styles.value}>
                                {currentStatus === 'awaiting' && 'Готова к активации'}
                                {currentStatus === 'in_progress' && 'В работе'}
                                {currentStatus === 'waiting_for_reward' && 'Готова к получению'}
                                {currentStatus === 'completed' && 'Завершена'}
                            </span>
                        </div>
                    )}
                </div>

                {/* --- Отображаем ошибки --- */}
                {modalError && <div className={styles.buyError}>{modalError}</div>}

                <Button
                    className={styles.buyButton}
                    onClick={primaryButtonHandler}
                    disabled={isPrimaryButtonDisabled}
                >
                    {primaryButtonText}
                </Button>
            </div>
        </Modal>
    );
};
