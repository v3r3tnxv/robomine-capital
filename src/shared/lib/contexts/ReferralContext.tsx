'use client';

// src/shared/lib/contexts/ReferralContext.tsx
import React, {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { UserReferralData, getUserReferrals } from '@/entities/user';
import { useUser } from '@/shared/lib/contexts';

// 1. Определяем интерфейс контекста
interface ReferralContextType {
    referralsData: UserReferralData | null;
    isLoading: boolean;
    error: string | null;
    refreshReferrals: () => Promise<void>;
}

// 2. Создаем контекст
const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

// 3. Создаем провайдер
export const ReferralProvider = ({ children }: { children: ReactNode }) => {
    // 4. Состояния для данных, загрузки и ошибок
    const [referralsData, setReferralsData] = useState<UserReferralData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 5. Получаем пользователя из UserContext, чтобы знать, когда начинать загрузку
    const { user } = useUser();

    // 6. Функция для загрузки данных рефералов
    const fetchReferralsData = useCallback(async () => {
        if (!user) {
            // Если пользователя нет, сбрасываем данные и состояние
            setReferralsData(null);
            setIsLoading(false);
            setError(null);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            console.log('ReferralContext: Запрос данных рефералов...');
            const data = await getUserReferrals();
            console.log('ReferralContext: Данные рефералов получены:', data);
            setReferralsData(data);
        } catch (err) {
            console.error('ReferralContext: Ошибка загрузки данных рефералов:', err);
            setError('Не удалось загрузить данные рефералов');
            // Сбрасываем данные в случае ошибки
            setReferralsData(null);
        } finally {
            setIsLoading(false);
        }
    }, [user]); // Зависимость от user

    // 7. Функция для обновления данных
    const refreshReferrals = useCallback(async () => {
        await fetchReferralsData();
    }, [fetchReferralsData]);

    // 8. Эффект для загрузки данных при монтировании и изменении пользователя
    useEffect(() => {
        fetchReferralsData();
    }, [fetchReferralsData]);

    // 9. Мемоизация значения контекста для оптимизации
    const contextValue = React.useMemo(
        () => ({
            referralsData,
            isLoading,
            error,
            refreshReferrals,
        }),
        [referralsData, isLoading, error, refreshReferrals]
    );

    // 10. Предоставляем значение контекста дочерним компонентам
    return <ReferralContext.Provider value={contextValue}>{children}</ReferralContext.Provider>;
};

// 11. Создаем хук для удобного использования контекста
export const useReferrals = (): ReferralContextType => {
    const context = useContext(ReferralContext);
    if (context === undefined) {
        throw new Error('useReferrals must be used within a ReferralProvider');
    }
    return context;
};
