'use client';

// widgets/user-initializer/ui/UserInitializer.tsx
import { useEffect, useState } from 'react';
import { checkUserExists, createUser, getMe } from '@/entities/user/api/user.api';
import { CreateUserDto, UserProfile } from '@/entities/user/model/types';
import { useTelegramWebApp } from '@/shared/lib/hooks/useTelegramWebApp';

export interface UserInitializationState {
    user: UserProfile | null;
    isLoading: boolean;
    error: string | null;
}

interface UserInitializerProps {
    children: (state: UserInitializationState) => React.ReactNode;
}

export const UserInitializer = ({ children }: UserInitializerProps) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { tgUser, isLoading: isTgLoading } = useTelegramWebApp();

    useEffect(() => {
        const initializeUser = async () => {
            try {
                if (isTgLoading) return;

                if (!tgUser?.id) {
                    setError('Не удалось получить данные пользователя из Telegram');
                    setIsLoading(false);
                    return;
                }

                setIsLoading(true);
                setError(null);

                // Проверяем существование пользователя
                const exists = await checkUserExists(tgUser.id);

                if (!exists) {
                    // Создаем нового пользователя
                    const userData: CreateUserDto = {
                        telegram_id: tgUser.id,
                        username: tgUser.username || `user_${tgUser.id}`,
                    };

                    const newUser = await createUser(userData);
                    setUser(newUser);
                } else {
                    // Получаем данные существующего пользователя
                    const userData = await getMe();
                    setUser(userData);
                }
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(`Ошибка инициализации: ${err.message}`);
                } else {
                    setError('Неизвестная ошибка инициализации');
                }
            } finally {
                setIsLoading(false);
            }
        };

        initializeUser();
    }, [tgUser, isTgLoading]);

    return <>{children({ user, isLoading, error })}</>;
};
