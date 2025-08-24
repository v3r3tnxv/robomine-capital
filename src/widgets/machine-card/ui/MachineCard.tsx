'use client';

// @/widgets/machine-card/ui/MachineCard.tsx
import { useCallback, useEffect, useState } from 'react';
import { memo } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { activateMachine, purchaseMachine, transitionMachine } from '@/entities/machine';
import { useMachines } from '@/shared/lib/contexts/MachineContext';
import { InfoButton } from '@/shared/ui';
import { MachineCardProps } from '../model';
import styles from './MachineCard.module.scss';
import { MachineInfoModal } from './MachineInfoModal';

export const MachineCard = memo(
    ({ status, price, image, machineData, onAction, machine }: MachineCardProps) => {
        const { updateMachineStatusLocally } = useMachines();
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [currentStatus, setCurrentStatus] = useState(status);
        const [progress, setProgress] = useState<number>(0);
        const [lastUpdated, setLastUpdated] = useState<number | null>(null);
        const [isProcessing, setIsProcessing] = useState(false);
        const [actionError, setActionError] = useState<string | null>(null);

        const isPurchased = currentStatus !== 'not_purchased';

        // Синхронизируем локальный статус с пропсами
        useEffect(() => {
            setCurrentStatus(status);
        }, [status]);

        // --- Рассчитываем доход за активацию ---
        const earnings = Number(machineData?.car?.daily_replenishment || 0);

        // --- Получаем время работы ---
        const getWorkTime = (): number => {
            const workTime = Number(process.env.NEXT_PUBLIC_CAR_WORK_TIME);
            return isNaN(workTime) ? 30 : workTime;
        };

        // --- Обновляем lastUpdated при изменении machineData ---
        useEffect(() => {
            if (machineData?.state_car?.last_updated) {
                setLastUpdated(machineData.state_car.last_updated);
            }
        }, [machineData?.state_car?.last_updated]);

        // --- Таймер для обновления прогресса ---
        useEffect(() => {
            setProgress(0);

            if (currentStatus === 'in_progress' && lastUpdated) {
                const startTime = lastUpdated;

                if (startTime <= 0) {
                    return;
                }

                const workTime = getWorkTime();
                const endTime = startTime + workTime;
                const now = Math.floor(Date.now() / 1000);

                // Если время уже вышло
                if (now >= endTime) {
                    setProgress(100);
                    const timer = setTimeout(() => {
                        setCurrentStatus('waiting_for_reward');
                        updateMachineStatusLocally(machineData?.car?.id || 0, 'waiting_for_reward');
                    }, 1000);
                    return () => clearTimeout(timer);
                }

                const updateProgress = () => {
                    const currentNow = Math.floor(Date.now() / 1000);
                    const remaining = endTime - currentNow;
                    const elapsed = workTime - remaining;
                    const progressPercent = Math.min(100, Math.max(0, (elapsed / workTime) * 100));

                    setProgress(progressPercent);

                    // Если прогресс завершен
                    if (progressPercent >= 100) {
                        setTimeout(() => {
                            setCurrentStatus('waiting_for_reward');
                            updateMachineStatusLocally(
                                machineData?.car?.id || 0,
                                'waiting_for_reward'
                            );
                        }, 1000);
                    }
                };

                // Первый запуск
                updateProgress();

                // Запускаем таймер для обновления прогресса
                const interval = setInterval(updateProgress, 1000);

                return () => {
                    clearInterval(interval);
                };
            }
        }, [currentStatus, lastUpdated, machineData?.car?.id, updateMachineStatusLocally]);

        // --- Обработчики событий ---
        useEffect(() => {
            const handleMachinePurchased = (event: CustomEvent) => {
                if (event.detail.machineId === machineData?.car?.id) {
                    setCurrentStatus('awaiting');
                }
            };

            const handleMachineActivated = (event: CustomEvent) => {
                if (event.detail.machineId === machineData?.car?.id) {
                    setCurrentStatus('in_progress');
                    setLastUpdated(event.detail.lastUpdated || Math.floor(Date.now() / 1000));
                }
            };

            const handleMachineTransitioned = (event: CustomEvent) => {
                if (event.detail.machineId === machineData?.car?.id) {
                    // Определяем следующий статус
                    const nextState =
                        machineData?.state_car?.remaining_uses &&
                        machineData.state_car.remaining_uses > 1
                            ? 'awaiting'
                            : 'completed';
                    setCurrentStatus(nextState);
                }
            };

            window.addEventListener('machinePurchased', handleMachinePurchased as EventListener);
            window.addEventListener('machineActivated', handleMachineActivated as EventListener);
            window.addEventListener(
                'machineTransitioned',
                handleMachineTransitioned as EventListener
            );

            return () => {
                window.removeEventListener(
                    'machinePurchased',
                    handleMachinePurchased as EventListener
                );
                window.removeEventListener(
                    'machineActivated',
                    handleMachineActivated as EventListener
                );
                window.removeEventListener(
                    'machineTransitioned',
                    handleMachineTransitioned as EventListener
                );
            };
        }, [machineData?.car?.id, machineData?.state_car?.remaining_uses]);

        // --- Рендер полосы прогресса ---
        const renderProgressBar = () => {
            if (currentStatus === 'in_progress') {
                return (
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                    </div>
                );
            }
            return null;
        };

        // --- Обработчик покупки ---
        const handleBuy = async () => {
            if (isProcessing) return;

            setIsProcessing(true);
            setActionError(null);

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
                setActionError(errorMessage);
            } finally {
                setIsProcessing(false);
            }
        };

        // --- Обработчик активации ---
        const handleActivate = async () => {
            if (isProcessing) return;

            setIsProcessing(true);
            setActionError(null);

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
                setActionError('Ошибка активации машины');
            } finally {
                setIsProcessing(false);
            }
        };

        // --- Обработчик получения награды ---
        const handleCollectReward = async () => {
            if (isProcessing || !machine.state_car?.id) return;

            setIsProcessing(true);
            setActionError(null);

            try {
                const result = await transitionMachine({ car_to_user_id: machine.state_car.id });

                if (result) {
                    console.log(`Награда получена для машины ${machine.car.id}.`);

                    // Определяем следующий статус
                    const nextState =
                        machine.state_car.remaining_uses > 1 ? 'awaiting' : 'completed';
                    setCurrentStatus(nextState);
                    updateMachineStatusLocally(machine.car.id, nextState);

                    if (onAction) {
                        onAction('transitioned', machine.car.id);
                    }
                }
            } catch (err) {
                console.error('Ошибка получения награды:', err);
                setActionError('Ошибка получения награды');
            } finally {
                setIsProcessing(false);
            }
        };

        // --- Получить текст для отображения вместо цены ---
        const getDisplayText = useCallback(() => {
            if (!isPurchased) {
                return `${price} USDT`;
            }

            switch (currentStatus) {
                case 'awaiting':
                    return `+${earnings} USDT за 23 ч.`;
                case 'in_progress':
                    return 'Работаем...';
                case 'waiting_for_reward':
                    return `${earnings} USDT`;
                case 'completed':
                    return 'Завершена';
                default:
                    return `${price} USDT`;
            }
        }, [isPurchased, currentStatus, price, earnings]);

        // --- Получить текст для статуса ---
        const getStatusText = useCallback(() => {
            if (!isPurchased) return isProcessing ? 'Покупка...' : 'Купить';

            switch (currentStatus) {
                case 'awaiting':
                    return isProcessing ? 'Активация...' : 'Активировать';
                case 'in_progress':
                    return null;
                case 'waiting_for_reward':
                    return isProcessing ? 'Получение...' : 'Забрать';
                case 'completed':
                    return 'Купить';
                default:
                    return 'Куплена';
            }
        }, [isPurchased, currentStatus, isProcessing]);

        // --- Получить обработчик для события ---
        const getActionHandler = () => {
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

        const actionHandler = getActionHandler();

        return (
            <>
                <button
                    className={clsx(styles.card)}
                    onClick={actionHandler}
                    type="button"
                    aria-label={`Майнинг-машина за ${price} USDT`}
                >
                    <InfoButton onClick={() => setIsModalOpen(true)} />
                    <div className={styles.plate} />

                    <Image
                        className={clsx(styles.image, { [styles.purchased]: isPurchased })}
                        src={`/images/${image}`}
                        width={100}
                        height={100}
                        alt="Майнинг-машина"
                    />

                    {getDisplayText() && (
                        <span className={styles.displayText}>{getDisplayText()}</span>
                    )}

                    {renderProgressBar()}

                    {getStatusText() && (
                        <span className={styles.statusText}>{getStatusText()}</span>
                    )}

                    {/* --- Отображаем ошибки --- */}
                    {actionError && <div className={styles.buyError}>{actionError}</div>}
                </button>

                {machineData && (
                    <MachineInfoModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        machine={machineData}
                        status={currentStatus}
                    />
                )}
            </>
        );
    }
);

MachineCard.displayName = 'MachineCard';
