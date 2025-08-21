// entities/user/model/useUserInit.ts
import { useEffect, useState } from 'react';
import { useTelegram } from '@/shared/lib/hooks/auth/useTelegram';
import { checkUserExists, createUser, getMe } from '../api/user.api';
import { CreateUserDto, UserProfile } from './types';

export const useUserInit = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { tgUser, isLoading: isTgLoading } = useTelegram();

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
                    console.log('Создаем нового пользователя');
                    const userData: CreateUserDto = {
                        telegram_id: tgUser.id,
                        username: tgUser.username || 'Unknown',
                    };

                    const newUser = await createUser(userData);
                    console.log('Пользователь создан:', newUser);
                    setUser(newUser);
                } else {
                    // Получаем данные существующего пользователя
                    console.log('Пользователь существует, получаем данные');
                    const userData = await getMe();
                    console.log('Данные пользователя:', userData);
                    setUser(userData);
                }
            } catch (err) {
                console.error('Ошибка инициализации пользователя:', err);
                setError('Ошибка при инициализации пользователя');
            } finally {
                setIsLoading(false);
            }
        };

        initializeUser();
    }, [tgUser, isTgLoading]);

    return { user, isLoading, error };
};
