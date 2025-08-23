'use client';

// @/widgets/machine-card/ui/MachineCard.tsx
import { useCallback, useEffect, useState } from 'react';
import { memo } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { useMachines } from '@/shared/lib/contexts/MachineContext';
import { MachineCardProps } from '../model';
import styles from './MachineCard.module.scss';
import { MachineInfoModal } from './MachineInfoModal';

export const MachineCard = memo(({ status, price, image, machineData }: MachineCardProps) => {
    const { updateMachineStatusLocally } = useMachines();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [localStatus, setLocalStatus] = useState(status);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);

    const isPurchased = localStatus !== 'not_purchased';

    // Синхронизируем локальный статус с пропсами
    useEffect(() => {
        setLocalStatus(status);
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

    // --- Таймер для состояния "в работе" ---
    useEffect(() => {
        setTimeLeft(null);
        setProgress(0);

        if (localStatus === 'in_progress' && lastUpdated) {
            const startTime = lastUpdated;

            if (startTime <= 0) {
                return;
            }

            const workTime = getWorkTime();
            const endTime = startTime + workTime;
            const now = Math.floor(Date.now() / 1000);

            // Если время уже вышло
            if (now >= endTime) {
                setTimeLeft(0);
                setProgress(100);
                const timer = setTimeout(() => {
                    setLocalStatus('waiting_for_reward');
                    updateMachineStatusLocally(machineData?.car?.id || 0, 'waiting_for_reward');
                }, 1000);
                return () => clearTimeout(timer);
            }

            const updateTimer = () => {
                const currentNow = Math.floor(Date.now() / 1000);
                const remaining = endTime - currentNow;

                if (remaining > 0) {
                    const elapsed = workTime - remaining;
                    const progressPercent = Math.min(100, Math.max(0, (elapsed / workTime) * 100));

                    setTimeLeft(remaining);
                    setProgress(progressPercent);
                } else {
                    setTimeLeft(0);
                    setProgress(100);
                    setTimeout(() => {
                        setLocalStatus('waiting_for_reward');
                        updateMachineStatusLocally(machineData?.car?.id || 0, 'waiting_for_reward');
                    }, 1000);
                }
            };

            // Первый запуск
            updateTimer();

            // Запускаем таймер
            const interval = setInterval(updateTimer, 1000);

            return () => {
                clearInterval(interval);
            };
        }
    }, [localStatus, lastUpdated, machineData?.car?.id, updateMachineStatusLocally]);

    // --- Обработчики событий ---
    useEffect(() => {
        const handleMachinePurchased = (event: CustomEvent) => {
            if (event.detail.machineId === machineData?.car?.id) {
                setLocalStatus('awaiting');
            }
        };

        const handleMachineActivated = (event: CustomEvent) => {
            if (event.detail.machineId === machineData?.car?.id) {
                setLocalStatus('in_progress');
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
                setLocalStatus(nextState);
            }
        };

        window.addEventListener('machinePurchased', handleMachinePurchased as EventListener);
        window.addEventListener('machineActivated', handleMachineActivated as EventListener);
        window.addEventListener('machineTransitioned', handleMachineTransitioned as EventListener);

        return () => {
            window.removeEventListener('machinePurchased', handleMachinePurchased as EventListener);
            window.removeEventListener('machineActivated', handleMachineActivated as EventListener);
            window.removeEventListener(
                'machineTransitioned',
                handleMachineTransitioned as EventListener
            );
        };
    }, [machineData?.car?.id, machineData?.state_car?.remaining_uses]);

    // --- Форматирование времени ---
    const formatTime = (seconds: number): string => {
        if (seconds === null || seconds < 0) return '00:00:00';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- Получить текст для отображения вместо цены ---
    const getDisplayText = useCallback(() => {
        if (!isPurchased) {
            return `${price} USDT`;
        }

        switch (localStatus) {
            case 'awaiting':
                return `+${earnings} USDT за 23 ч.`;
            case 'in_progress':
                if (timeLeft !== null) {
                    return formatTime(timeLeft);
                }
                return 'В работе...';
            case 'waiting_for_reward':
                return `+${earnings} USDT`;
            case 'completed':
                return 'Завершена';
            default:
                return `${price} USDT`;
        }
    }, [isPurchased, localStatus, price, earnings, timeLeft]);

    // --- Получить текст для статуса ---
    const getStatusText = useCallback(() => {
        if (!isPurchased) return 'Подробнее';

        switch (localStatus) {
            case 'awaiting':
                return 'Ожидает активации';
            case 'in_progress':
                return 'В работе';
            case 'waiting_for_reward':
                return 'Майнинг завершен';
            case 'completed':
                return 'Завершена';
            default:
                return 'Куплена';
        }
    }, [isPurchased, localStatus]);

    // Функция для получения класса прогресса
    const getProgressClass = useCallback(() => {
        if (progress < 10) return styles.progress0;
        if (progress < 20) return styles.progress10;
        if (progress < 30) return styles.progress20;
        if (progress < 40) return styles.progress30;
        if (progress < 50) return styles.progress40;
        if (progress < 60) return styles.progress50;
        if (progress < 70) return styles.progress60;
        if (progress < 80) return styles.progress70;
        if (progress < 90) return styles.progress80;
        if (progress < 100) return styles.progress90;
        return styles.progress100;
    }, [progress]);

    return (
        <>
            <button
                className={clsx(styles.card, localStatus === 'in_progress' && getProgressClass())}
                onClick={() => setIsModalOpen(true)}
                type="button"
                aria-label={`Майнинг-машина за ${price} USDT`}
            >
                <div className={clsx(styles.plate, styles[`${localStatus}`])} />

                <Image
                    className={clsx(styles.image, { [styles.purchased]: isPurchased })}
                    src={`/images/${image}`}
                    width={100}
                    height={100}
                    alt="Майнинг-машина"
                />

                <span className={styles.displayText}>{getDisplayText()}</span>

                <span className={styles.statusText}>{getStatusText()}</span>
            </button>

            {machineData && (
                <MachineInfoModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAction={(action, machineId) => {
                        // Отправляем глобальные события
                        switch (action) {
                            case 'purchased':
                                window.dispatchEvent(
                                    new CustomEvent('machinePurchased', {
                                        detail: { machineId },
                                    })
                                );
                                break;
                            case 'activated':
                                window.dispatchEvent(
                                    new CustomEvent('machineActivated', {
                                        detail: {
                                            machineId,
                                            lastUpdated: Math.floor(Date.now() / 1000),
                                        },
                                    })
                                );
                                break;
                            case 'transitioned':
                                window.dispatchEvent(
                                    new CustomEvent('machineTransitioned', {
                                        detail: { machineId },
                                    })
                                );
                                break;
                        }
                    }}
                    machine={machineData}
                    isPurchased={isPurchased}
                    status={localStatus}
                />
            )}
        </>
    );
});

MachineCard.displayName = 'MachineCard';
