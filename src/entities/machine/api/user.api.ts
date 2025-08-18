// entities/machine/api/machine.api.ts
import { api } from '@/shared/api';
import {
    ActivateMachineDto,
    MachineAttributes,
    MachineWithState,
    PurchaseMachineDto,
    TransitionMachineDto,
} from '../model/types';

/**
 * Получить список всех машин с состоянием для текущего пользователя
 */
export const getAllMachines = async (): Promise<MachineWithState[]> => {
    const response = await api.get<MachineWithState[]>('/machines/');
    return response.data;
};

/**
 * Получить конкретную машину по ID
 */
export const getMachineById = async (id: number): Promise<MachineAttributes> => {
    const response = await api.get<MachineAttributes>(`/machines/${id}`);
    return response.data;
};

/**
 * Купить машину
 */
export const purchaseMachine = async (data: PurchaseMachineDto): Promise<boolean> => {
    const response = await api.post<boolean>('/machines/purchase', data);
    return response.data;
};

/**
 * Активировать купленную машину
 */
export const activateMachine = async (data: ActivateMachineDto): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>('/machines/activate', data);
    return response.data;
};

/**
 * Перевести машину в следующее состояние (например, из waiting_for_reward в awaiting)
 */
export const transitionMachine = async (
    data: TransitionMachineDto
): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>('/machines/take', data);
    return response.data;
};
