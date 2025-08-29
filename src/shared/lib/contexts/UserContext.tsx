'use client';

// src/entities/user/model/UserContext.tsx
import React, {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { AxiosError } from 'axios';
import { CreateUserDto, UserAttributes, createUser, getMe } from '@/entities/user';
import { useReferral } from '@/shared/lib/hooks/useReferral';
import { useTelegramWebApp } from '@/shared/lib/hooks/useTelegramWebApp';

// Расширяем интерфейс Window только для нашей переменной
declare global {
    interface Window {
        telegramUser?: UserAttributes;
    }
}

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
    const { getReferralId } = useReferral();

    const fetchUserData = useCallback(async () => {
        if (!tgUser?.id) {
            console.log('No tgUser.id found');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            console.log('Fetching user data for telegram_id:', tgUser.id);

            // Пытаемся получить данные пользователя
            let userData: UserAttributes;
            try {
                userData = await getMe();
                console.log('User found:', userData);
            } catch (getMeError) {
                console.log('getMe error:', getMeError);
                // Проверяем, является ли ошибка AxiosError с response
                if (getMeError instanceof AxiosError) {
                    // Если пользователь не найден (404), создаем его
                    if (getMeError.response?.status === 404) {
                        console.log('User not found, creating new user');
                        // Получаем ref_id
                        const referralId = getReferralId();
                        console.log('Referral ID to use:', referralId);

                        const userDataForCreation: CreateUserDto = {
                            telegram_id: tgUser.id,
                            username: tgUser.username || `id_${tgUser.id}`,
                            ...(referralId && referralId !== tgUser.id && { ref_id: referralId }),
                        };

                        console.log('Creating user with data:', userDataForCreation);

                        userData = await createUser(userDataForCreation);
                        console.log('User created:', userData);
                    } else {
                        throw getMeError; // Другая ошибка - пробрасываем дальше
                    }
                } else {
                    throw getMeError; // Не Axios ошибка - пробрасываем дальше
                }
            }

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
    }, [tgUser, getReferralId]); // Зависит от tgUser и getReferralId

    const refreshUserBalance = useCallback(async () => {
        if (!user) return;
        try {
            const updatedUser = await getMe();
            setUser(updatedUser);
        } catch (err) {
            console.error('Ошибка обновления баланса:', err);
        }
    }, [user]);

    const refreshUser = useCallback(async () => {
        await fetchUserData();
    }, [fetchUserData]);

    const updateUserLocally = useCallback((updates: Partial<UserAttributes>) => {
        setUser((prevUser) => {
            if (!prevUser) return null;
            return { ...prevUser, ...updates };
        });
    }, []);

    useEffect(() => {
        console.log('UserProvider useEffect triggered', { tgUser, isTgLoading });
        if (!isTgLoading && tgUser?.id) {
            fetchUserData();
        } else if (!isTgLoading && !tgUser?.id) {
            setIsLoading(false);
        }
    }, [tgUser, isTgLoading, fetchUserData]);

    const contextValue = React.useMemo(
        () => ({
            user,
            isLoading,
            error,
            refreshUser,
            refreshUserBalance,
            updateUserLocally,
        }),
        [user, isLoading, error, refreshUser, refreshUserBalance, updateUserLocally]
    );

    return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
