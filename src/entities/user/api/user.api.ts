// entities/user/api/user.api.ts
import { api } from '@/shared/api';
import {
    BanUserDto,
    CreateUserDto,
    ReplenishDto,
    UserAttributes,
    UserProfile,
    UserReferralData,
} from '../model/types';

/**
 * Проверить, существует ли пользователь по telegram_id
 */
// entities/user/api/user.api.ts
/**
 * Проверить, существует ли пользователь по telegram_id
 */
export const checkUserExists = async (telegram_id: number): Promise<boolean> => {
    try {
        const response = await api.get<boolean>(`/users/check/${telegram_id}`);
        return response.data;
    } catch (error) {
        // Проверяем, является ли ошибка Axios ошибкой с response
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status: number } };
            if (axiosError.response?.status === 404) {
                return false; // Пользователь не найден
            }
        }
        // Для других ошибок логируем и пробрасываем
        console.error('Error checking user existence:', error);
        throw error;
    }
};

/**
 * Создать нового пользователя
 */
export const createUser = async (userData: CreateUserDto): Promise<UserAttributes> => {
    const response = await api.post<UserAttributes>('/users/create', userData);
    return response.data;
};

/**
 * Получить данные текущего пользователя
 */
export const getMe = async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/users/getMe');
    return response.data;
};

/**
 * Получить рефералов текущего пользователя
 */
export const getUserReferrals = async (): Promise<UserReferralData> => {
    const response = await api.get<UserReferralData>('/users/get-referrals');
    return response.data;
};

/**
 * Пополнить баланс пользователя (админская функция или для тестов)
 * ВАЖНО: Этот endpoint требует авторизации админа на бэкенде
 */
export const replenishUserBalance = async (data: ReplenishDto): Promise<UserAttributes> => {
    const response = await api.put<UserAttributes>('/users/replenish', data);
    return response.data;
};

/**
 * Забанить пользователя (админская функция)
 * ВАЖНО: Этот endpoint требует авторизации админа на бэкенде
 */
export const banUser = async (user_id: number, data: BanUserDto): Promise<UserAttributes> => {
    const response = await api.put<UserAttributes>(`/users/ban/${user_id}`, data);
    return response.data;
};

/**
 * Разбанить пользователя (админская функция)
 * ВАЖНО: Этот endpoint требует авторизации админа на бэкенде
 */
export const unbanUser = async (user_id: number): Promise<UserAttributes> => {
    const response = await api.put<UserAttributes>(`/users/unban/${user_id}`);
    return response.data;
};

/**
 * Получить список всех пользователей (админская функция)
 * ВАЖНО: Этот endpoint требует авторизации админа на бэкенде
 */
export const getAllUsers = async (): Promise<UserAttributes[]> => {
    const response = await api.get<UserAttributes[]>('/users/admin/get-all-users');
    return response.data;
};
