'use client';

// @/shared/lib/contexts/MachineContext.tsx
import React, {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { MachineWithState, getAllMachines } from '@/entities/machine';

// Определяем возможные статусы машины
// Предполагается, что они совпадают с теми, что в MachineToUserAttributes
// Если они определены где-то как тип или константы, лучше импортировать оттуда
type MachineStatus =
    | 'not_purchased'
    | 'awaiting'
    | 'in_progress'
    | 'waiting_for_reward'
    | 'completed';

interface MachineContextType {
    machines: MachineWithState[];
    loading: boolean;
    error: string | null;
    refreshMachines: () => Promise<void>;
    // Обновляет любые поля машины
    updateMachineLocally: (machineId: number, updates: Partial<MachineWithState>) => void;
    // Обновляет статус машины (если state_car существует)
    updateMachineStatusLocally: (machineId: number, newStatus: MachineStatus) => void;
    // Обновляет конкретные поля state_car (если он существует)
    updateMachineStateCarLocally: (
        machineId: number,
        updates: Partial<NonNullable<MachineWithState['state_car']>>
    ) => void;
    // Новый метод для обновления remaining_uses
    updateMachineRemainingUses: (machineId: number, newRemainingUses: number) => void;
}

const MachineContext = createContext<MachineContextType | undefined>(undefined);

export const MachineProvider = ({ children }: { children: ReactNode }) => {
    const [machines, setMachines] = useState<MachineWithState[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshMachines = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedMachines = await getAllMachines();
            setMachines(fetchedMachines);
        } catch (err) {
            console.error('Ошибка при обновлении списка машин:', err);
            setError('Не удалось обновить список машин');
        } finally {
            setLoading(false);
        }
    }, []);

    // Точечное обновление машины без перезагрузки всего списка
    const updateMachineLocally = useCallback(
        (machineId: number, updates: Partial<MachineWithState>) => {
            setMachines((prevMachines) =>
                prevMachines.map((machine) => {
                    if (machine.car.id === machineId) {
                        // Создаем поверхностную копию и применяем обновления
                        return { ...machine, ...updates };
                    }
                    return machine;
                })
            );
        },
        []
    );

    // Обновление только статуса (только если state_car существует)
    const updateMachineStatusLocally = useCallback(
        (machineId: number, newStatus: MachineStatus) => {
            setMachines((prevMachines) =>
                prevMachines.map((machine) => {
                    // Проверяем, что state_car существует, прежде чем обновлять
                    if (machine.car.id === machineId && machine.state_car) {
                        return {
                            ...machine,
                            state_car: {
                                ...machine.state_car,
                                status: newStatus,
                            },
                        };
                    }
                    return machine;
                })
            );
        },
        []
    );

    // Обновление конкретных полей state_car (только если он существует)
    const updateMachineStateCarLocally = useCallback(
        (machineId: number, updates: Partial<NonNullable<MachineWithState['state_car']>>) => {
            setMachines((prevMachines) =>
                prevMachines.map((machine) => {
                    // Проверяем, что state_car существует, прежде чем обновлять
                    if (machine.car.id === machineId && machine.state_car) {
                        return {
                            ...machine,
                            state_car: {
                                ...machine.state_car,
                                ...updates,
                            },
                        };
                    }
                    return machine;
                })
            );
        },
        []
    );

    // Новый метод для обновления remaining_uses
    const updateMachineRemainingUses = useCallback(
        (machineId: number, newRemainingUses: number) => {
            setMachines((prevMachines) =>
                prevMachines.map((machine) => {
                    // Проверяем, что state_car существует, прежде чем обновлять
                    if (machine.car.id === machineId && machine.state_car) {
                        return {
                            ...machine,
                            state_car: {
                                ...machine.state_car,
                                remaining_uses: newRemainingUses,
                            },
                        };
                    }
                    return machine;
                })
            );
        },
        []
    );

    useEffect(() => {
        refreshMachines();
    }, [refreshMachines]);

    // --- КРИТИЧЕСКИ ВАЖНО: useMemo для value ---
    const contextValue = React.useMemo(
        () => ({
            // <-- useMemo
            machines,
            loading,
            error,
            refreshMachines,
            updateMachineLocally,
            updateMachineStatusLocally,
            updateMachineStateCarLocally,
            updateMachineRemainingUses,
        }),
        [
            machines,
            loading,
            error,
            refreshMachines,
            updateMachineLocally,
            updateMachineStatusLocally,
            updateMachineStateCarLocally,
            updateMachineRemainingUses,
        ]
    );
    // --- КОНЕЦ КРИТИЧЕСКОЙ ЧАСТИ ---

    return (
        <MachineContext.Provider value={contextValue}>
            {/* <-- Передаем мемоизированное значение */}
            {children}
        </MachineContext.Provider>
    );
};

export const useMachines = (): MachineContextType => {
    const context = useContext(MachineContext);
    if (!context) {
        throw new Error('useMachines must be used within a MachineProvider');
    }
    return context;
};
