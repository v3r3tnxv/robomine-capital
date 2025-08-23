'use client';

// widgets/user-initializer/ui/UserInitializer.tsx
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { checkUserExists, createUser, getMe } from '@/entities/user';
import { CreateUserDto, UserProfile } from '@/entities/user/model/types';
import { useTelegramWebApp } from '@/shared/lib/hooks/useTelegramWebApp';

// Добавляем импорт AxiosError

interface UserInitializerProps {
    children: React.ReactNode;
    onUserLoaded?: (user: UserProfile | null) => void;
}

export const UserInitializer = ({ children, onUserLoaded }: UserInitializerProps) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { tgUser, isLoading: isTgLoading } = useTelegramWebApp();

    useEffect(() => {
        const initializeUser = async () => {
            try {
                console.log('Начинаем инициализацию пользователя...');

                if (isTgLoading) {
                    console.log('Данные Telegram еще загружаются...');
                    return;
                }

                if (!tgUser?.id) {
                    console.log('ID пользователя Telegram не найден');
                    setError('Не удалось получить данные пользователя из Telegram');
                    setIsLoading(false);
                    return;
                }

                console.log('ID пользователя Telegram:', tgUser.id);
                setIsLoading(true);
                setError(null);

                // Проверяем существование пользователя
                console.log('Проверяем существование пользователя...');
                const exists = await checkUserExists(tgUser.id);
                console.log('Пользователь существует:', exists);

                if (!exists) {
                    console.log('Пользователь не найден, создаем нового...');
                    // Создаем нового пользователя
                    const userData: CreateUserDto = {
                        telegram_id: tgUser.id,
                        username: tgUser.username || `user_${tgUser.id}`,
                    };

                    console.log('Данные для создания пользователя:', userData);
                    try {
                        const newUser = await createUser(userData);
                        console.log('Пользователь создан:', newUser);
                        setUser(newUser);
                        onUserLoaded?.(newUser);
                    } catch (createError: unknown) {
                        // Обрабатываем 409 Conflict - пользователь уже существует
                        if (
                            createError instanceof AxiosError &&
                            createError.response?.status === 409
                        ) {
                            console.log('Пользователь уже существует, получаем данные...');
                            // Получаем данные существующего пользователя
                            const userData = await getMe();
                            console.log('Данные пользователя получены:', userData);
                            setUser(userData);
                            onUserLoaded?.(userData);
                        } else {
                            // Другая ошибка - пробрасываем её дальше
                            throw createError;
                        }
                    }
                } else {
                    console.log('Пользователь найден, получаем данные...');
                    // Получаем данные существующего пользователя
                    const userData = await getMe();
                    console.log('Данные пользователя получены:', userData);
                    setUser(userData);
                    onUserLoaded?.(userData);
                }
            } catch (err: unknown) {
                console.error('Ошибка инициализации пользователя:', err);
                if (err instanceof Error) {
                    setError(`Ошибка инициализации: ${err.message}`);
                } else {
                    setError('Неизвестная ошибка инициализации');
                }
                onUserLoaded?.(null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeUser();
    }, [tgUser, isTgLoading, onUserLoaded]);

    // Сохраняем данные пользователя в глобальную переменную
    useEffect(() => {
        if (user && typeof window !== 'undefined') {
            const globalWindow = window as typeof window & {
                telegramUser?: UserProfile;
            };
            globalWindow.telegramUser = user;
        }
    }, [user]);

    if (isLoading) {
        return <div>Загрузка пользователя...</div>;
    }

    if (error) {
        return (
            <div>
                Ошибка инициализации пользователя: {error}
                <button onClick={() => window.location.reload()}>Повторить</button>
                {children}
            </div>
        );
    }

    return <>{children}</>;
};
