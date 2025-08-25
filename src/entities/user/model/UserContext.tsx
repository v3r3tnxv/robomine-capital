'use client';

// src/entities/user/model/UserContext.tsx
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { UserAttributes, getMe } from '@/entities/user';
import { useTelegramWebApp } from '@/shared/lib/hooks/useTelegramWebApp';

// Хук для получения данных из Telegram WebApp

// --- Расширяем тип контекста ---
interface UserContextType {
    user: UserAttributes | null;
    isLoading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
    refreshUserBalance: () => Promise<void>;
    updateUserLocally: (updates: Partial<UserAttributes>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserAttributes | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { tgUser, isLoading: isTgLoading } = useTelegramWebApp(); // Получаем данные пользователя из Telegram

    // --- Функция для загрузки/обновления полных данных пользователя ---
    const fetchUserData = async () => {
        if (!tgUser?.id) return; // Не пытаемся загрузить, если нет tgUser
        try {
            setIsLoading(true);
            setError(null);
            const userData = await getMe();
            setUser(userData);
            // Опционально: сохраняем в глобальную переменную, если нужно
            if (typeof window !== 'undefined') {
                window.telegramUser = userData;
            }
        } catch (err) {
            console.error('Ошибка загрузки данных пользователя:', err);
            setError('Не удалось загрузить данные пользователя');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Функция для обновления только баланса ---
    const refreshUserBalance = async () => {
        if (!user) return; // Нечего обновлять, если пользователя нет
        try {
            // Получаем обновленные данные пользователя
            const updatedUser = await getMe();
            // Обновляем состояние контекста, заменяя старые данные новыми
            setUser(updatedUser);
            // Или, если хочешь обновить только конкретные поля:
            // setUser(prevUser => {
            //   if (!prevUser) return updatedUser;
            //   return {
            //     ...prevUser,
            //     balance: updatedUser.balance,
            //     tokens: updatedUser.tokens,
            //     ref_balance: updatedUser.ref_balance,
            //     // ... другие поля баланса ...
            //   };
            // });
        } catch (err) {
            console.error('Ошибка обновления баланса:', err);
            // Можно установить ошибку в контексте или просто залогировать
        }
    };

    // --- Функция для полного обновления пользователя ---
    const refreshUser = async () => {
        await fetchUserData(); // Используем существующую функцию
    };

    // --- Функция для мгновенного локального обновления ---
    const updateUserLocally = (updates: Partial<UserAttributes>) => {
        setUser((prevUser) => {
            if (!prevUser) return null;
            return { ...prevUser, ...updates };
        });
    };

    // --- Инициализация пользователя при монтировании или изменении tgUser ---
    useEffect(() => {
        if (!isTgLoading && tgUser?.id) {
            fetchUserData();
        } else if (!isTgLoading && !tgUser?.id) {
            // Если tgUser загрузился, но id нет (например, не авторизован в боте)
            setIsLoading(false);
            // setError('Пользователь не авторизован'); // Опционально
        }
    }, [tgUser, isTgLoading]);

    return (
        <UserContext.Provider
            value={{
                user,
                isLoading,
                error,
                refreshUser,
                refreshUserBalance,
                updateUserLocally,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
