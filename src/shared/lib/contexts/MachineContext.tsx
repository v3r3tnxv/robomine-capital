// @/shared/lib/contexts/MachineContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MachineWithState, getAllMachines } from '@/entities/machine';

// Определяем возможные статусы машины
// Предполагается, что они совпадают с теми, что в MachineToUserAttributes
// Если они определены где-то как тип или константы, лучше импортировать оттуда
type MachineStatus = 'not_purchased' | 'awaiting' | 'in_progress' | 'waiting_for_reward' | 'completed';

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
    updateMachineStateCarLocally: (machineId: number, updates: Partial<NonNullable<MachineWithState['state_car']>>) => void;
}

const MachineContext = createContext<MachineContextType | undefined>(undefined);

export const MachineProvider = ({ children }: { children: ReactNode }) => {
    const [machines, setMachines] = useState<MachineWithState[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshMachines = async () => {
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
    };

    // Точечное обновление машины без перезагрузки всего списка
    const updateMachineLocally = (machineId: number, updates: Partial<MachineWithState>) => {
        setMachines(prevMachines => 
            prevMachines.map(machine => {
                if (machine.car.id === machineId) {
                    // Создаем поверхностную копию и применяем обновления
                    return { ...machine, ...updates };
                }
                return machine;
            })
        );
    };

    // Обновление только статуса (только если state_car существует)
    const updateMachineStatusLocally = (machineId: number, newStatus: MachineStatus) => {
        setMachines(prevMachines => 
            prevMachines.map(machine => {
                // Проверяем, что state_car существует, прежде чем обновлять
                if (machine.car.id === machineId && machine.state_car) {
                    return {
                        ...machine,
                        state_car: {
                            ...machine.state_car,
                            status: newStatus
                        }
                    };
                }
                return machine;
            })
        );
    };

    // Обновление конкретных полей state_car (только если он существует)
    const updateMachineStateCarLocally = (
        machineId: number, 
        updates: Partial<NonNullable<MachineWithState['state_car']>>
    ) => {
        setMachines(prevMachines => 
            prevMachines.map(machine => {
                // Проверяем, что state_car существует, прежде чем обновлять
                if (machine.car.id === machineId && machine.state_car) {
                    return {
                        ...machine,
                        state_car: {
                            ...machine.state_car,
                            ...updates
                        }
                    };
                }
                return machine;
            })
        );
    };

    useEffect(() => {
        refreshMachines();
    }, []);

    return (
        <MachineContext.Provider value={{
            machines,
            loading,
            error,
            refreshMachines,
            updateMachineLocally,
            updateMachineStatusLocally,
            updateMachineStateCarLocally
        }}>
            {children}
        </MachineContext.Provider>
    );
};

export const useMachines = () => {
    const context = useContext(MachineContext);
    if (context === undefined) {
        throw new Error('useMachines must be used within a MachineProvider');
    }
    return context;
};