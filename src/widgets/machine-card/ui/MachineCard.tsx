'use client';

// @/widgets/machine-card/ui/MachineCard.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { memo } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { activateMachine, purchaseMachine, transitionMachine } from '@/entities/machine';
import { useUser } from '@/entities/user';
import { useMachines } from '@/shared/lib/contexts/MachineContext';
import { InfoButton, ProgressBar } from '@/shared/ui';
import { MachineCardProps } from '../model';
import styles from './MachineCard.module.scss';
import { MachineInfoModal } from './MachineInfoModal';

export const MachineCard = memo(
    ({ status, price, image, machineData, onAction }: MachineCardProps) => {
        const { updateMachineStatusLocally } = useMachines();
        const { refreshUserBalance } = useUser();
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [currentStatus, setCurrentStatus] = useState(status);
        const [progress, setProgress] = useState<number>(0);
        const [lastUpdated, setLastUpdated] = useState<number | null>(null);
        const [isProcessing, setIsProcessing] = useState(false);
        const [actionError, setActionError] = useState<string | null>(null);
        const intervalRef = useRef<NodeJS.Timeout | null>(null);

        const isPurchased = currentStatus !== 'not_purchased';

        const totalActivations = machineData?.car?.lifespan ?? 0;
        const remainingUses = machineData?.state_car?.remaining_uses ?? 0;

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

        // Очищаем интервал при размонтировании
        useEffect(() => {
            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }, []);

        // --- Таймер для обновления прогресса ---
        useEffect(() => {
            if (currentStatus !== 'in_progress' || !lastUpdated || !machineData?.car?.id) {
                return;
            }

            const startTime = lastUpdated;
            const workTime = getWorkTime();
            const endTime = startTime + workTime;

            const updateProgress = () => {
                const now = Math.floor(Date.now() / 1000);
                const remaining = Math.max(0, endTime - now);
                const elapsed = workTime - remaining;
                const progressPercent = Math.min(100, Math.max(0, (elapsed / workTime) * 100));

                setProgress(progressPercent);

                if (progressPercent >= 100) {
                    setCurrentStatus('waiting_for_reward');
                    if (machineData.car.id) {
                        updateMachineStatusLocally(machineData.car.id, 'waiting_for_reward');
                    }
                    return false; // Останавливаем интервал
                }
                return true; // Продолжаем интервал
            };

            // Первый запуск
            updateProgress();

            // Запускаем таймер
            const interval = setInterval(() => {
                if (!updateProgress()) {
                    clearInterval(interval);
                }
            }, 1000);

            intervalRef.current = interval;

            const intervalId = intervalRef.current;

            return () => {
                if (intervalId) {
                    clearInterval(intervalId);
                }
            };
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

        // --- Обработчик покупки ---
        const handleBuy = async () => {
            if (isProcessing || !machineData?.car?.id) return;

            setIsProcessing(true);
            setActionError(null);

            try {
                const success = await purchaseMachine({ car_id: machineData.car.id });

                if (success) {
                    console.log(`Машина ${machineData.car.id} успешно куплена.`);

                    // Локальное обновление без перезагрузки
                    setCurrentStatus('awaiting');
                    updateMachineStatusLocally(machineData.car.id, 'awaiting');

                    window.dispatchEvent(
                        new CustomEvent('machinePurchased', {
                            detail: { machineId: machineData.car.id },
                        })
                    );

                    if (onAction) {
                        onAction('purchased', machineData.car.id);
                    }

                    // --- Обновляем баланс пользователя ---
                    try {
                        await refreshUserBalance();
                        console.log('Баланс пользователя обновлён после покупки машины.');
                    } catch (balanceError) {
                        console.error(
                            'Ошибка обновления баланса после покупки машины:',
                            balanceError
                        );
                        // Ошибка обновления баланса не должна блокировать основную операцию
                    }
                    // --- Конец обновления баланса ---
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
            if (isProcessing || !machineData?.car?.id) return;

            setIsProcessing(true);
            setActionError(null);

            try {
                const result = await activateMachine({ car_id: machineData.car.id });

                if (result) {
                    console.log(`Машина ${machineData.car.id} активирована.`);

                    // Локальное обновление без перезагрузки
                    const newStatus = 'in_progress';
                    setCurrentStatus(newStatus);
                    updateMachineStatusLocally(machineData.car.id, newStatus);

                    const lastUpdated = Math.floor(Date.now() / 1000);
                    setLastUpdated(lastUpdated); // ← Это важно! Добавлено
                    window.dispatchEvent(
                        new CustomEvent('machineActivated', {
                            detail: {
                                machineId: machineData.car.id,
                                lastUpdated,
                            },
                        })
                    );

                    if (onAction) {
                        onAction('activated', machineData.car.id);
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
            if (isProcessing || !machineData?.state_car?.id) return;

            setIsProcessing(true);
            setActionError(null);

            try {
                const result = await transitionMachine({
                    car_to_user_id: machineData.state_car.id,
                });

                if (result) {
                    console.log(`Награда получена для машины ${machineData.car.id}.`);

                    // Определяем следующий статус
                    const nextState =
                        machineData.state_car.remaining_uses > 1 ? 'awaiting' : 'completed';
                    setCurrentStatus(nextState);
                    updateMachineStatusLocally(machineData.car.id, nextState);

                    if (onAction) {
                        onAction('transitioned', machineData.car.id);
                    }

                    // --- Обновляем баланс пользователя ---
                    try {
                        await refreshUserBalance();
                        console.log('Баланс пользователя обновлён после получения награды.');
                    } catch (balanceError) {
                        console.error(
                            'Ошибка обновления баланса после получения награды:',
                            balanceError
                        );
                        // Ошибка обновления баланса не должна блокировать основную операцию
                    }
                    // --- Конец обновления баланса ---
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
                    return <ProgressBar progress={progress} className={styles.progressBar} />;
                case 'waiting_for_reward':
                    return isProcessing ? 'Получение...' : 'Забрать';
                case 'completed':
                    return 'Купить';
                default:
                    return 'Куплена';
            }
        }, [isPurchased, currentStatus, isProcessing, progress]);

        // --- Получить обработчик для события ---
        const getActionHandler = () => {
            if (!machineData?.car?.id) return undefined;

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
                    disabled={isProcessing}
                >
                    <div className={styles.info}>
                        {isPurchased ? (
                            // Если машина куплена, отображаем оставшиеся активации
                            <span className={styles.activationsDisplay}>{remainingUses}</span>
                        ) : (
                            // Если не куплена, отображаем кнопку с иконкой Info
                            <InfoButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsModalOpen(true);
                                }}
                            />
                        )}
                    </div>

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
