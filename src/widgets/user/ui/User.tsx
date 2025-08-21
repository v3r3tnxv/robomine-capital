'use client';

import { useEffect, useState } from 'react';
import { getMe } from '@/entities/user/api/user.api';
import { UserProfile } from '@/entities/user/model/types';
import { useTelegram } from '@/shared/lib/hooks/auth/useTelegram';
import styles from './User.module.scss';

export const User = () => {
    const { user: telegramUser, initData, telegramId, isAuthenticated, isLoading } = useTelegram();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!isAuthenticated || !telegramId) {
                return;
            }

            try {
                const userData = await getMe();
                setUser(userData);
            } catch (err) {
                console.error('Ошибка при загрузке данных пользователя:', err);
                setError('Не удалось загрузить данные пользователя');
            }
        };

        if (isAuthenticated && telegramId) {
            fetchUserData();
        }
    }, [isAuthenticated, telegramId]);

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
            <span className={styles.userStatus}>{user.blago_status}</span>
            <span className={styles.userName}>{user.username}</span>
        </div>
    );
};
