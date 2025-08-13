// entities/user/model/api/getProfile.ts
import { ApiResponse, api } from '@/shared/api';
import type { User } from '../model';

export const getProfile = async (telegramId: number): Promise<User> => {
    const res = await api.post<ApiResponse<{ user: User }>>(`/user`, { telegramId });
    return res.data.data.user;
};
