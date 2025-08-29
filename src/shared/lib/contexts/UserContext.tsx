'use client';

// src/entities/user/model/UserContext.tsx (фрагмент)
import React, {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { UserAttributes, getMe } from '@/entities/user';
import { useTelegramWebApp } from '@/shared/lib/hooks/useTelegramWebApp';

interface UserContextType {
    user: UserAttributes | null;
    isLoading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
    refreshUserBalance: () => Promise<void>;
    updateUserLocally: (updates: Partial<UserAttributes>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserAttributes | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { tgUser, isLoading: isTgLoading } = useTelegramWebApp();

    const fetchUserData = useCallback(async () => {
        if (!tgUser?.id) return;
        try {
            setIsLoading(true);
            setError(null);
            const userData = await getMe();
            setUser(userData);
            if (typeof window !== 'undefined') {
                window.telegramUser = userData;
            }
        } catch (err) {
            console.error('Ошибка загрузки данных пользователя:', err);
            setError('Не удалось загрузить данные пользователя');
        } finally {
            setIsLoading(false);
        }
    }, [tgUser?.id]); // Зависит от tgUser.id

    const refreshUserBalance = useCallback(async () => {
        if (!user) return;
        try {
            const updatedUser = await getMe();
            setUser(updatedUser);
        } catch (err) {
            console.error('Ошибка обновления баланса:', err);
        }
    }, [user]); // Зависит от user

    const refreshUser = useCallback(async () => {
        // <-- useCallback
        await fetchUserData();
    }, [fetchUserData]); // Зависит от fetchUserData

    const updateUserLocally = useCallback((updates: Partial<UserAttributes>) => {
        // <-- useCallback
        setUser((prevUser) => {
            if (!prevUser) return null;
            return { ...prevUser, ...updates };
        });
    }, []); // Не зависит от внешних переменных, кроме setUser

    useEffect(() => {
        if (!isTgLoading && tgUser?.id) {
            fetchUserData();
        } else if (!isTgLoading && !tgUser?.id) {
            setIsLoading(false);
        }
    }, [tgUser, isTgLoading, fetchUserData]); // Добавлен fetchUserData в зависимости

    // --- КРИТИЧЕСКИ ВАЖНО: useCallback для всего value ---
    const contextValue = React.useMemo(
        () => ({
            // <-- useMemo для value
            user,
            isLoading,
            error,
            refreshUser,
            refreshUserBalance,
            updateUserLocally,
        }),
        [user, isLoading, error, refreshUser, refreshUserBalance, updateUserLocally]
    );
    // --- КОНЕЦ КРИТИЧЕСКОЙ ЧАСТИ ---

    return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
