'use client';

import { useEffect, useState } from 'react';
import { createUser } from '@/entities/user/api/user.api';
import { UserProfile } from '@/entities/user/model/types';
import { useTelegram } from '@/shared/lib/hooks/auth/useTelegram';
import styles from './User.module.scss';

export const User = () => {
    const { user: telegramUser, initData, telegramId, isAuthenticated, isLoading } = useTelegram();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const createAndFetchUserData = async () => {
            if (!isAuthenticated || !telegramUser) {
                return;
            }

            try {
                console.log('Creating user:', telegramUser);
                const userData = await createUser({
                    telegram_id: telegramUser.id,
                    username: telegramUser.username || '',
                    ref_id: 0, // по умолчанию
                    tokens: 0, // по умолчанию
                });
                setUser(userData);
            } catch (err) {
                console.error('Ошибка при создании пользователя:', err);
                setError('Не удалось создать пользователя');
            }
        };

        if (isAuthenticated && telegramUser) {
            createAndFetchUserData();
        }
    }, [isAuthenticated, telegramUser]);

    if (isLoading) {
        return <div className={styles.user}>Загрузка...</div>;
    }

    if (error) {
        return <div className={styles.user}>{error}</div>;
    }

    if (!isAuthenticated) {
        return <div className={styles.user}>Пожалуйста, откройте это приложение в Telegram</div>;
    }

    if (!user) {
        return <div className={styles.user}>Пользователь не найден</div>;
    }

    return (
        <div className={styles.user}>
            <span className={styles.userStatus}>
                {user.blago_status ? 'Активный' : 'Неактивный'}
            </span>
            <span className={styles.userName}>{user.username}</span>
        </div>
    );
};
