// entities/withdrawal/api/withdrawal.api.ts
import { api } from '@/shared/api';
import {
    CreateWithdrawalDto,
    PendingWithdrawal,
    TransferResult,
    WithdrawalRestriction,
} from '../model/types';

/**
 * Инициировать вывод средств
 */
export const transfer = async (data: CreateWithdrawalDto): Promise<TransferResult> => {
    const response = await api.post<TransferResult>('/withdrawal/transfer', data);
    return response.data;
};

/**
 * Получить ограничения на вывод средств
 */
export const getWithdrawalRestriction = async (): Promise<WithdrawalRestriction> => {
    const response = await api.get<WithdrawalRestriction>('/withdrawal/restriction');
    return response.data;
};

/**
 * Получить список ожидающих подтверждения выводов (админская функция)
 * ВАЖНО: Этот endpoint требует авторизации админа на бэкенде
 */
export const getPendingWithdrawals = async (): Promise<PendingWithdrawal[]> => {
    const response = await api.get<PendingWithdrawal[]>('/withdrawal/admin/pending');
    return response.data;
};

/**
 * Подтвердить вывод средств (админская функция)
 * ВАЖНО: Этот endpoint требует авторизации админа на бэкенде
 */
export const confirmWithdrawal = async (id: number): Promise<TransferResult> => {
    const response = await api.post<TransferResult>(`/withdrawal/admin/confirm/${id}`);
    return response.data;
};

/**
 * Отклонить вывод средств (админская функция)
 * ВАЖНО: Этот endpoint требует авторизации админа на бэкенде
 */
export const rejectWithdrawal = async (id: number): Promise<TransferResult> => {
    const response = await api.post<TransferResult>(`/withdrawal/admin/reject/${id}`);
    return response.data;
};
