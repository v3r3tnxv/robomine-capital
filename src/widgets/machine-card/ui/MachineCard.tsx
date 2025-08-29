'use client';

// @/widgets/machine-card/ui/MachineCard.tsx
import { useCallback, useEffect, useState } from 'react';
import { memo } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { activateMachine, purchaseMachine, transitionMachine } from '@/entities/machine';
import { useUser } from '@/entities/user';
import { ClaimAnimation } from '@/features/claim-animation';
import { Coin } from '@/shared/assets/icons';
import { useMachines } from '@/shared/lib/contexts/MachineContext';
import { useTimers } from '@/shared/lib/contexts/TimerContext';
import { InfoButton, ProgressBar } from '@/shared/ui';
import { MachineCardProps } from '../model';
import styles from './MachineCard.module.scss';
import { MachineInfoModal } from './MachineInfoModal';

export const MachineCard = memo(
    ({ status, price, image, machineData, onAction }: MachineCardProps) => {
        const { updateMachineStatusLocally, updateMachineRemainingUses, machines } = useMachines(); // Добавили machines
        const { timers, startTimer, stopTimer, getTimer, isTimerActive } = useTimers();
        const { refreshUserBalance } = useUser();
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [currentStatus, setCurrentStatus] = useState(status);
        const [lastUpdated, setLastUpdated] = useState<number | null>(null);
        const [isProcessing, setIsProcessing] = useState(false);
        const [actionError, setActionError] = useState<string | null>(null);
        const [isCollectingReward, setIsCollectingReward] = useState(false);
        const [showClaimAnimation, setShowClaimAnimation] = useState(false);

        const isPurchased = currentStatus !== 'not_purchased';

        const totalActivations = machineData?.car?.lifespan ?? 0;
        const [remainingUses, setRemainingUses] = useState<number>(
            machineData?.state_car?.remaining_uses ?? 0
        );

        // Получаем данные таймера для этой машины
        const timerData = getTimer(machineData?.car?.id || 0);

        // Синхронизируем локальный статус и remainingUses с пропсами при их изменении
        useEffect(() => {
            setCurrentStatus(status);
            setRemainingUses(machineData?.state_car?.remaining_uses ?? 0);
        }, [status, machineData?.state_car?.remaining_uses]);

        // --- Рассчитываем доход за активацию ---
        const earnings = Number(machineData?.car?.daily_replenishment || 0);

        // --- Получаем время работы (мемоизировано) ---
        const getWorkTime = useCallback((): number => {
            const workTime = Number(process.env.NEXT_PUBLIC_CAR_WORK_TIME);
            return isNaN(workTime) ? 30 : workTime;
        }, []);

        // --- Обновляем lastUpdated при изменении machineData ---
        useEffect(() => {
            if (machineData?.state_car?.last_updated) {
                setLastUpdated(machineData.state_car.last_updated);
            }
        }, [machineData?.state_car?.last_updated]);

        // --- Синхронизация с контекстом машин ---
        useEffect(() => {
            // Находим обновленные данные о машине в контексте
            const updatedMachine = machines.find((m) => m.car.id === machineData?.car?.id);

            if (updatedMachine && updatedMachine.state_car) {
                // Обновляем remainingUses если данные в контексте отличаются
                if (updatedMachine.state_car.remaining_uses !== remainingUses) {
                    setRemainingUses(updatedMachine.state_car.remaining_uses);
                }

                // Обновляем статус если данные в контексте отличаются
                const contextStatus = updatedMachine.state_car.status ?? 'not_purchased';
                if (contextStatus !== currentStatus) {
                    setCurrentStatus(contextStatus);
                }
            }
        }, [machines, machineData?.car?.id, remainingUses, currentStatus]);

        // --- Управление таймером ---
        useEffect(() => {
            const machineId = machineData?.car?.id;
            if (!machineId || !lastUpdated) return;

            if (currentStatus === 'in_progress') {
                // Запускаем таймер только если он еще не активен
                if (!isTimerActive(machineId)) {
                    startTimer(machineId, lastUpdated, getWorkTime());
                }
            } else {
                // Останавливаем таймер для других статусов
                if (currentStatus !== 'waiting_for_reward') {
                    stopTimer(machineId);
                }
            }

            return () => {
                // Не останавливаем таймер при размонтировании для статуса in_progress
                if (currentStatus !== 'in_progress') {
                    stopTimer(machineId);
                }
            };
        }, [
            currentStatus,
            lastUpdated,
            machineData?.car?.id,
            startTimer,
            stopTimer,
            getWorkTime,
            isTimerActive,
        ]);

        // --- Обработчики событий ---
        const handleMachinePurchased = useCallback(
            (event: CustomEvent) => {
                if (event.detail.machineId === machineData?.car?.id) {
                    setCurrentStatus('awaiting');
                    // Устанавливаем правильное количество remainingUses после покупки
                    const totalLifespan = machineData?.car?.lifespan || 0;
                    setRemainingUses(totalLifespan);
                }
            },
            [machineData?.car?.id, machineData?.car?.lifespan]
        );

        const handleMachineActivated = useCallback(
            (event: CustomEvent) => {
                if (event.detail.machineId === machineData?.car?.id) {
                    setCurrentStatus('in_progress');
                    setLastUpdated(event.detail.lastUpdated || Math.floor(Date.now() / 1000));
                }
            },
            [machineData?.car?.id]
        );

        useEffect(() => {
            window.addEventListener('machinePurchased', handleMachinePurchased as EventListener);
            window.addEventListener('machineActivated', handleMachineActivated as EventListener);

            return () => {
                window.removeEventListener(
                    'machinePurchased',
                    handleMachinePurchased as EventListener
                );
                window.removeEventListener(
                    'machineActivated',
                    handleMachineActivated as EventListener
                );
            };
        }, [handleMachinePurchased, handleMachineActivated]);

        // --- Обработчик покупки ---
        const handleBuy = async () => {
            if (isProcessing || !machineData?.car?.id) return;

            setIsProcessing(true);
            setActionError(null);

            try {
                const success = await purchaseMachine({ car_id: machineData.car.id });

                if (success) {
                    console.log(`Машина ${machineData.car.id} успешно куплена.`);

                    setCurrentStatus('awaiting');
                    updateMachineStatusLocally(machineData.car.id, 'awaiting');

                    // Устанавливаем правильное количество remainingUses
                    const totalLifespan = machineData.car.lifespan;
                    updateMachineRemainingUses(machineData.car.id, totalLifespan);
                    setRemainingUses(totalLifespan);

                    window.dispatchEvent(
                        new CustomEvent('machinePurchased', {
                            detail: { machineId: machineData.car.id },
                        })
                    );

                    if (onAction) {
                        onAction('purchased', machineData.car.id);
                    }

                    try {
                        await refreshUserBalance();
                        console.log('Баланс пользователя обновлён после покупки машины.');
                    } catch (balanceError) {
                        console.error(
                            'Ошибка обновления баланса после покупки машины:',
                            balanceError
                        );
                    }
                } else {
                    throw new Error('Сервер сообщил о неудаче операции.');
                }
            } catch (err) {
                console.error('Ошибка при покупке машины:', err);
                let errorMessage = 'Недостаточно средств на балансе.';
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
            if (currentStatus !== 'awaiting') {
                console.warn('Попытка активации в неправильном статусе:', currentStatus);
                setIsProcessing(false);
                return;
            }

            if (isProcessing || !machineData?.car?.id) return;

            setIsProcessing(true);
            setActionError(null);

            try {
                const result = await activateMachine({ car_id: machineData.car.id });

                if (result) {
                    console.log(`Машина ${machineData.car.id} активирована.`);

                    const newRemainingUses = Math.max(0, remainingUses - 1);
                    updateMachineRemainingUses(machineData.car.id, newRemainingUses);
                    setRemainingUses(newRemainingUses);

                    const newStatus = 'in_progress';
                    setCurrentStatus(newStatus);
                    updateMachineStatusLocally(machineData.car.id, newStatus);

                    const lastUpdated = Math.floor(Date.now() / 1000);
                    setLastUpdated(lastUpdated);

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
            if (currentStatus !== 'waiting_for_reward') {
                console.warn('Попытка получить награду в неправильном статусе:', currentStatus);
                setIsProcessing(false);
                return;
            }

            if (isProcessing || !machineData?.state_car?.id) return;

            setIsProcessing(true);
            setActionError(null);
            setIsCollectingReward(true);
            setShowClaimAnimation(true);

            try {
                const result = await transitionMachine({
                    car_to_user_id: machineData.state_car.id,
                });

                if (result) {
                    console.log(`Награда получена для машины ${machineData.car.id}.`);

                    const nextState = remainingUses > 0 ? 'awaiting' : 'completed';
                    setCurrentStatus(nextState);
                    updateMachineStatusLocally(machineData.car.id, nextState);

                    try {
                        await refreshUserBalance();
                        console.log('Баланс пользователя обновлён после получения награды.');
                    } catch (balanceError) {
                        console.error('Ошибка обновления баланса:', balanceError);
                    }
                }
            } catch (err) {
                console.error('Ошибка получения награды:', err);
                setActionError('Ошибка получения награды');
            } finally {
                setTimeout(() => {
                    setShowClaimAnimation(false);
                    setIsCollectingReward(false);
                }, 1000);
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
                    return (
                        <>
                            +{earnings} <Coin width={20} height={20} />
                        </>
                    );
                case 'in_progress':
                    // Используем данные из контекста таймеров
                    return (
                        <span className={styles.timer}>
                            {timerData?.timeLeftFormatted || '24:00:00'}
                        </span>
                    );
                case 'waiting_for_reward':
                    return (
                        <>
                            {earnings} <Coin width={20} height={20} />
                        </>
                    );
                case 'completed':
                    return 'Завершена';
                default:
                    return `${price} USDT`;
            }
        }, [isPurchased, currentStatus, price, earnings, timerData?.timeLeftFormatted]);

        // --- Получить текст для статуса ---
        const getStatusText = useCallback(() => {
            if (!isPurchased) return 'Купить';

            switch (currentStatus) {
                case 'awaiting':
                    return 'Активировать';
                case 'in_progress':
                    // Используем прогресс из контекста таймеров
                    return <ProgressBar progress={timerData?.progress || 0} />;
                case 'waiting_for_reward':
                    return 'Забрать';
                case 'completed':
                    return 'Купить';
                default:
                    return 'Куплена';
            }
        }, [isPurchased, currentStatus, timerData?.progress]);

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
                <div className={styles.cardWrapper}>
                    <button
                        className={clsx(styles.card)}
                        onClick={actionHandler}
                        type="button"
                        aria-label={`${machineData!.car.name}`}
                        disabled={isProcessing}
                    >
                        <div className={styles.info}>
                            {isPurchased ? (
                                <span
                                    className={styles.activationsDisplay}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsModalOpen(true);
                                    }}
                                >
                                    {remainingUses} / {totalActivations}
                                </span>
                            ) : (
                                <InfoButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsModalOpen(true);
                                    }}
                                />
                            )}
                        </div>

                        <div className={clsx(styles.plate, styles[`${currentStatus}`])} />

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

                        {actionError && <div className={styles.buyError}>{actionError}</div>}
                    </button>

                    {showClaimAnimation && <ClaimAnimation />}
                </div>

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
