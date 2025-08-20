'use client';

// @/widgets/machine-card/ui/MachineCard.tsx
import { useEffect, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { MachineCardProps } from '../model';
import styles from './MachineCard.module.scss';
import { MachineInfoModal } from './MachineInfoModal';

export const MachineCard = ({ status, price, image, machineData }: MachineCardProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cardStatus, setCardStatus] = useState(status);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);

    // --- Синхронизируем cardStatus с пропсом status ---
    useEffect(() => {
        setCardStatus(status);
        // ✅ Также обновляем lastUpdated при изменении machineData
        if (machineData?.state_car?.last_updated) {
            setLastUpdated(machineData.state_car.last_updated);
        }
    }, [status, machineData?.state_car?.last_updated]);

    // --- Определяем, куплена ли машина ---
    const isPurchased = cardStatus !== 'not_purchased';

    // --- Рассчитываем доход за активацию ---
    const earnings = Number(machineData?.car?.daily_replenishment || 0);

    // --- Получаем время работы ---
    const getWorkTime = (): number => {
        const workTime = Number(process.env.NEXT_PUBLIC_CAR_WORK_TIME);
        return isNaN(workTime) ? 30 : workTime;
    };

    // --- Таймер для состояния "в работе" ---
    useEffect(() => {
        setTimeLeft(null);
        setProgress(0);

        if (cardStatus === 'in_progress' && lastUpdated) {
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
                    setCardStatus('waiting_for_reward');
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
                        setCardStatus('waiting_for_reward');
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
    }, [cardStatus, lastUpdated]);

    // --- Обработчик события покупки ---
    useEffect(() => {
        const handlePurchase = (event: CustomEvent) => {
            if (event.detail.machineId === machineData?.car?.id) {
                setCardStatus('awaiting');
            }
        };

        window.addEventListener('machinePurchased', handlePurchase as EventListener);

        return () => {
            window.removeEventListener('machinePurchased', handlePurchase as EventListener);
        };
    }, [machineData?.car?.id]);

    // ✅ Обработчик события активации
    useEffect(() => {
        const handleActivate = (event: CustomEvent) => {
            if (event.detail.machineId === machineData?.car?.id) {
                setCardStatus('in_progress');
                // ✅ Устанавливаем lastUpdated сразу
                if (event.detail.lastUpdated) {
                    setLastUpdated(event.detail.lastUpdated);
                } else {
                    // Если не передано - используем текущее время
                    setLastUpdated(Math.floor(Date.now() / 1000));
                }
            }
        };

        window.addEventListener('machineActivated', handleActivate as EventListener);

        return () => {
            window.removeEventListener('machineActivated', handleActivate as EventListener);
        };
    }, [machineData?.car?.id]);

    // --- Автоматическое обновление статуса из БД ---
    useEffect(() => {
        if (machineData?.state_car?.status && machineData.state_car.status !== cardStatus) {
            // Не обновляем, если таймер работает
            if (cardStatus !== 'in_progress') {
                setCardStatus(machineData.state_car.status);
                // ✅ Также обновляем lastUpdated
                if (machineData.state_car.last_updated) {
                    setLastUpdated(machineData.state_car.last_updated);
                }
            }
        }
    }, [machineData?.state_car?.status, cardStatus, machineData?.state_car?.last_updated]);

    // --- Форматирование времени ---
    const formatTime = (seconds: number): string => {
        if (seconds === null || seconds < 0) return '00:00:00';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- Получить текст для отображения вместо цены ---
    const getDisplayText = () => {
        if (!isPurchased) {
            return `${price} USDT`;
        }

        switch (cardStatus) {
            case 'awaiting':
                return `+${earnings.toFixed(2)} USDT за 23 ч.`;
            case 'in_progress':
                if (timeLeft !== null) {
                    return formatTime(timeLeft);
                }
                return 'В работе...';
            case 'waiting_for_reward':
                return `+${earnings.toFixed(2)} USDT`;
            case 'completed':
                return 'Завершена';
            default:
                return `${price} USDT`;
        }
    };

    // --- Получить текст для статуса ---
    const getStatusText = () => {
        if (!isPurchased) return 'Подробнее';

        switch (cardStatus) {
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
    };

    // Функция для получения класса прогресса
    const getProgressClass = () => {
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
    };

    return (
        <>
            <button
                className={clsx(
                    styles.card,
                    cardStatus === 'in_progress' && getProgressClass()
                    // Убрали пульсацию
                )}
                onClick={() => setIsModalOpen(true)}
                type="button"
                aria-label={`Майнинг-машина за ${price} USDT`}
            >
                <div className={clsx(styles.plate, styles[`${cardStatus}`])} />

                <Image
                    className={clsx(styles.image, { [styles.purchased]: isPurchased })}
                    src={`/images/${image}`}
                    width={100}
                    height={100}
                    alt="Майнинг-машина"
                />

                <span className={styles.activationInfo}>{getDisplayText()}</span>

                <span className={styles.label}>{getStatusText()}</span>
            </button>

            {machineData && (
                <MachineInfoModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAction={(action, machineId) => {
                        if (action === 'purchased') {
                            setCardStatus('awaiting');
                        } else if (action === 'activated') {
                            setCardStatus('in_progress');
                        } else if (action === 'transitioned') {
                            if (
                                machineData.state_car?.remaining_uses &&
                                machineData.state_car.remaining_uses > 1
                            ) {
                                setCardStatus('awaiting');
                            } else {
                                setCardStatus('completed');
                            }
                        }
                    }}
                    machine={machineData}
                    isPurchased={isPurchased}
                    status={cardStatus}
                />
            )}
        </>
    );
};
