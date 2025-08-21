// src/entities/user/model/useUser.ts
import { useEffect, useState } from 'react';
import { useTelegram } from '@/shared/lib/hooks/auth/useTelegram';

interface UserData {
    userId: number | null;
    isLoading: boolean;
    error: string | null;
}

export const useUser = () => {
    const { telegramId, initData, isAuthenticated, isLoading: telegramLoading } = useTelegram();
    const [userData, setUserData] = useState<UserData>({
        userId: null,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        if (telegramLoading) return;

        if (!isAuthenticated || !telegramId) {
            setUserData({
                userId: null,
                isLoading: false,
                error: 'No Telegram authentication',
            });
            return;
        }

        // Здесь логика получения/создания пользователя из БД
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        telegramId,
                        initData,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData({
                        userId: data.userId,
                        isLoading: false,
                        error: null,
                    });
                } else {
                    throw new Error('Failed to fetch user');
                }
            } catch (error) {
                setUserData({
                    userId: null,
                    isLoading: false,
                    error: error instanceof Error ? error.message : 'Failed to load user',
                });
            }
        };

        fetchUser();
    }, [telegramId, initData, isAuthenticated, telegramLoading]);

    return userData;
};
