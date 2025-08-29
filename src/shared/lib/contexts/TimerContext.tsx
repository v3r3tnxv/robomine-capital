'use client';

// @/shared/lib/contexts/TimerContext.tsx
import React, {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { useMachines } from '@/shared/lib/contexts/MachineContext';

// Добавляем импорт

interface TimerData {
    timeLeftFormatted: string;
    progress: number;
    isActive: boolean;
}

interface TimerContextType {
    timers: Record<number, TimerData>;
    startTimer: (machineId: number, lastUpdated: number, workTime: number) => void;
    stopTimer: (machineId: number) => void;
    getTimer: (machineId: number) => TimerData | undefined;
    isTimerActive: (machineId: number) => boolean;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
    const [timers, setTimers] = useState<Record<number, TimerData>>({});
    const intervalsRef = useRef<Record<number, NodeJS.Timeout>>({});
    const { updateMachineStatusLocally } = useMachines(); // Получаем метод обновления статуса

    const getWorkTime = useCallback((): number => {
        const workTime = Number(process.env.NEXT_PUBLIC_CAR_WORK_TIME);
        return isNaN(workTime) ? 30 : workTime;
    }, []);

    const getTimer = useCallback(
        (machineId: number): TimerData | undefined => {
            return timers[machineId];
        },
        [timers]
    );

    const isTimerActive = useCallback((machineId: number): boolean => {
        return !!intervalsRef.current[machineId];
    }, []);

    const stopTimer = useCallback((machineId: number) => {
        if (intervalsRef.current[machineId]) {
            clearInterval(intervalsRef.current[machineId]);
            delete intervalsRef.current[machineId];
        }

        setTimers((prev) => {
            const newTimers = { ...prev };
            delete newTimers[machineId];
            return newTimers;
        });
    }, []);

    const startTimer = useCallback(
        (machineId: number, lastUpdated: number, workTime: number) => {
            // Если таймер уже активен, не перезапускаем его
            if (intervalsRef.current[machineId]) {
                return;
            }

            const endTime = lastUpdated + workTime;

            const updateTimer = () => {
                const now = Math.floor(Date.now() / 1000);
                const remainingSeconds = Math.max(0, endTime - now);
                const elapsedSeconds = Math.max(0, now - lastUpdated);

                // Рассчитываем прогресс в процентах
                const progressPercent = Math.min(100, (elapsedSeconds / workTime) * 100);

                // Форматируем оставшееся время в HH:MM:SS
                const hours = Math.floor(remainingSeconds / 3600);
                const minutes = Math.floor((remainingSeconds % 3600) / 60);
                const seconds = remainingSeconds % 60;

                const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
                    .toString()
                    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                // Обновляем состояние таймера
                setTimers((prev) => ({
                    ...prev,
                    [machineId]: {
                        timeLeftFormatted: formattedTime,
                        progress: progressPercent,
                        isActive: remainingSeconds > 0,
                    },
                }));

                // Если время вышло, останавливаем таймер и обновляем статус машины
                if (remainingSeconds <= 0) {
                    stopTimer(machineId);
                    // Обновляем статус машины на 'waiting_for_reward'
                    updateMachineStatusLocally(machineId, 'waiting_for_reward');
                }
            };

            // Первый запуск немедленно
            updateTimer();

            // Запускаем интервал
            intervalsRef.current[machineId] = setInterval(updateTimer, 1000);
        },
        [stopTimer, updateMachineStatusLocally]
    );

    // Очищаем все интервалы при размонтировании
    useEffect(() => {
        // Копируем текущие интервалы в локальную переменную
        const intervalsToClear = { ...intervalsRef.current };

        return () => {
            Object.values(intervalsToClear).forEach(clearInterval);
        };
    }, []);

    // Значение контекста
    const contextValue = React.useMemo(
        () => ({
            timers,
            startTimer,
            stopTimer,
            getTimer,
            isTimerActive,
        }),
        [timers, startTimer, stopTimer, getTimer, isTimerActive]
    );

    return <TimerContext.Provider value={contextValue}>{children}</TimerContext.Provider>;
};

export const useTimers = (): TimerContextType => {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error('useTimers must be used within a TimerProvider');
    }
    return context;
};
