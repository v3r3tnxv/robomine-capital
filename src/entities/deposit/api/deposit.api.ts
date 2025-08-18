// entities/deposit/api/deposit.api.ts
import { api } from '@/shared/api';
import { DepositDto } from '../model/types';

/**
 * Создать инвойс для пополнения баланса
 * @param asset - Криптовалюта (например, "TON", "BTC")
 * @param amount - Сумма пополнения
 * @returns Данные о созданном депозите
 */
export const createDepositInvoice = async (asset: string, amount: string): Promise<DepositDto> => {
    const response = await api.post<DepositDto>('/deposits/create', {
        asset,
        amount,
    });

    return response.data;
};

/**
 * Получить историю депозитов текущего пользователя
 * @returns Список депозитов
 */
export const getDepositHistory = async (): Promise<DepositDto[]> => {
    const response = await api.get<DepositDto[]>('/deposits/history');

    return response.data;
};
