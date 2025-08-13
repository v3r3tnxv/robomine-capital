// entities/user/api/user.api.ts
import { ApiResponse, api } from '@/shared/api';
import type { User } from '../model';

export const collectReward = async (
    userId: number
): Promise<{
    message: string;
    lastRewardCollectedAt: number | null;
    nextRewardAvailableAt: number | null;
    balanceMain?: number;
}> => {
    const res = await api.post<
        ApiResponse<{
            message: string;
            lastRewardCollectedAt: number | null;
            nextRewardAvailableAt: number | null;
            balanceMain?: number;
        }>
    >('/user/collect-reward', { userId });
    return res.data.data;
};

export const getUserByTelegramId = async (telegramId: number): Promise<User> => {
    const res = await api.post<ApiResponse<{ user: User }>>('/user', {
        telegramId,
    });
    return res.data.data.user;
};

export const createUser = async (data: {
    telegramId?: number;
    username: string;
    refId?: number | null;
    balanceMain?: number;
    balanceCoin?: number;
}): Promise<User> => {
    const res = await api.post<ApiResponse<User>>('/users/register', data);
    return res.data.data;
};

export const updateUser = async (
    id: number,
    data: Partial<{
        username: string;
        balanceMain: number;
        balanceCoin: number;
        refId: number;
    }>
): Promise<User> => {
    const res = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return res.data.data;
};

export const getAllUsers = async (): Promise<User[]> => {
    const res = await api.get<ApiResponse<User[]>>('/users');
    return res.data.data;
};

export const deleteUser = async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
};
