'use client';

// @/widgets/machine-card/ui/MachineCard.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { memo } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { activateMachine, purchaseMachine, transitionMachine } from '@/entities/machine';
import { useUser } from '@/entities/user';
import { ClaimAnimation } from '@/features/claim-animation';
import { Coin } from '@/shared/assets/icons';
import { useMachines } from '@/shared/lib/contexts/MachineContext';
import { InfoButton, ProgressBar } from '@/shared/ui';
import { MachineCardProps } from '../model';
import styles from './MachineCard.module.scss';
import { MachineInfoModal } from './MachineInfoModal';

export const MachineCard = memo(
    ({ status, price, image, machineData, onAction }: MachineCardProps) => {
        const { updateMachineStatusLocally, updateMachineRemainingUses } = useMachines();
        const { refreshUserBalance } = useUser();
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [currentStatus, setCurrentStatus] = useState(status);
        const [lastUpdated, setLastUpdated] = useState<number | null>(null);
        const [isProcessing, setIsProcessing] = useState(false);
        const [actionError, setActionError] = useState<string | null>(null);
        const [timeLeftFormatted, setTimeLeftFormatted] = useState<string>('24:00:00');
        const [progress, setProgress] = useState<number>(0); // Добавляем состояние для прогресса
        const intervalRef = useRef<NodeJS.Timeout | null>(null);
        const [isCollectingReward, setIsCollectingReward] = useState(false);
        const [showClaimAnimation, setShowClaimAnimation] = useState(false);

        const isPurchased = currentStatus !== 'not_purchased';

        const totalActivations = machineData?.car?.lifespan ?? 0;
        const [remainingUses, setRemainingUses] = useState<number>(
            machineData?.state_car?.remaining_uses ?? 0
        );

        // Синхронизируем локальный статус и remainingUses с пропсами при их изменении
        useEffect(() => {
            setCurrentStatus(status);
            // Обновляем локальное состояние remainingUses при изменении пропса
            setRemainingUses(machineData?.state_car?.remaining_uses ?? 0);
        }, [status, machineData?.state_car?.remaining_uses]);

        // --- Рассчитываем доход за активацию ---
        const earnings = Number(machineData?.car?.daily_replenishment || 0);

        // --- Получаем время работы (мемоизировано) ---
        const getWorkTime = useCallback((): number => {
            const workTime = Number(process.env.NEXT_PUBLIC_CAR_WORK_TIME);
            return isNaN(workTime) ? 30 : workTime;
        }, []); // useCallback нужен, чтобы getWorkTime не пересоздавалась и не вызывала лишние эффекты

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

        // --- Таймер для обновления отображения оставшегося времени и прогресса ---
        useEffect(() => {
            // Очищаем предыдущий интервал при каждом запуске эффекта
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }

            // Проверки для запуска таймера
            if (currentStatus !== 'in_progress' || !lastUpdated || !machineData?.car?.id) {
                // Если статус не 'in_progress', сбрасываем отображение таймера и прогресс
                setTimeLeftFormatted('24:00:00');
                setProgress(0);
                return; // Не запускаем интервал
            }

            const startTime = lastUpdated;
            const workTime = getWorkTime();
            const endTime = startTime + workTime;

            const updateTimerDisplay = () => {
                const now = Math.floor(Date.now() / 1000);
                const remainingSeconds = Math.max(0, endTime - now);
                const elapsedSeconds = Math.max(0, now - startTime);

                // Рассчитываем прогресс в процентах
                const progressPercent = Math.min(100, (elapsedSeconds / workTime) * 100);
                setProgress(progressPercent);

                if (remainingSeconds <= 0) {
                    // Время вышло
                    setTimeLeftFormatted('00:00:00');
                    setProgress(100);
                    // Останавливаем интервал внутри этой же функции
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                    // Автоматически меняем статус на 'waiting_for_reward'
                    setCurrentStatus('waiting_for_reward');
                    // Обновляем статус в контексте
                    if (machineData.car.id) {
                        updateMachineStatusLocally(machineData.car.id, 'waiting_for_reward');
                    }
                    return;
                }

                // Форматируем оставшееся время в HH:MM:SS
                const hours = Math.floor(remainingSeconds / 3600);
                const minutes = Math.floor((remainingSeconds % 3600) / 60);
                const seconds = remainingSeconds % 60;

                const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
                    .toString()
                    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                setTimeLeftFormatted(formattedTime);
            };

            // Первый запуск немедленно
            updateTimerDisplay();

            // Запускаем интервал обновления таймера
            const interval = setInterval(updateTimerDisplay, 1000); // Обновляем каждую секунду

            intervalRef.current = interval;

            // Функция очистки для useEffect: останавливаем интервал, если эффект перезапускается или компонент размонтируется
            return () => {
                if (intervalRef.current === interval) {
                    clearInterval(interval);
                    intervalRef.current = null;
                }
            };
        }, [
            currentStatus,
            lastUpdated,
            machineData?.car?.id,
            updateMachineStatusLocally,
            getWorkTime,
        ]); // Зависимости: только те, которые влияют на необходимость перезапуска таймера

        // --- Обработчики событий ---
        const handleMachinePurchased = useCallback(
            (event: CustomEvent) => {
                if (event.detail.machineId === machineData?.car?.id) {
                    setCurrentStatus('awaiting');
                }
            },
            [machineData?.car?.id]
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
            // Проверяем правильный статус
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

                    // обновляем remainingUses в контексте И локально
                    const newRemainingUses = Math.max(0, remainingUses - 1);
                    updateMachineRemainingUses(machineData.car.id, newRemainingUses);
                    setRemainingUses(newRemainingUses);

                    // Обновляем статус
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
            // Проверяем правильный статус
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

                    // Используем ТЕКУЩЕЕ значение remainingUses (без уменьшения)
                    const nextState = remainingUses > 0 ? 'awaiting' : 'completed';
                    setCurrentStatus(nextState);
                    updateMachineStatusLocally(machineData.car.id, nextState);

                    // Обновляем баланс пользователя
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
                    // Возвращаем отформатированное время вместо ProgressBar
                    return <span className={styles.timer}>{timeLeftFormatted}</span>;
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
        }, [isPurchased, currentStatus, price, earnings, timeLeftFormatted]);

        // --- Получить текст для статуса ---
        const getStatusText = useCallback(() => {
            if (!isPurchased) return isProcessing ? 'Покупка...' : 'Купить';

            switch (currentStatus) {
                case 'awaiting':
                    return isProcessing ? 'Активация...' : 'Активировать';
                case 'in_progress':
                    // Теперь возвращаем ProgressBar с актуальным прогрессом
                    return <ProgressBar progress={progress} />;
                case 'waiting_for_reward':
                    return isProcessing ? 'Получение...' : 'Забрать';
                case 'completed':
                    return 'Купить';
                default:
                    return 'Куплена';
            }
        }, [isPurchased, currentStatus, isProcessing, progress]); // Добавлена зависимость progress

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
                                // Если машина куплена, отображаем оставшиеся активации
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
                                // Если не куплена, отображаем кнопку с иконкой Info
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

                        {/* --- Отображаем ошибки --- */}
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
