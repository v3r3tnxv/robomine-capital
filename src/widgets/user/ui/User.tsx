'use client';

import { useEffect, useState } from 'react';
import { getMe } from '@/entities/user/api/user.api';
import { UserProfile } from '@/entities/user/model/types';
import styles from './User.module.scss';

// Клиентский компонент
export const User = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Вызов API происходит на клиенте
                const userData = await getMe();
                setUser(userData);
            } catch (err) {
                console.error('Ошибка при загрузке данных пользователя (клиент):', err);
                setError('Не удалось загрузить данные пользователя');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return <div className={styles.user}>Загрузка...</div>;
    }

    if (error) {
        return <div className={styles.user}>{error}</div>;
    }

    if (!user) {
        return <div className={styles.user}>Пользователь не найден</div>;
    }

    return (
        <div className={styles.user}>
            <span className={styles.userStatus}>{String(user.blago_status)}</span>
            <span className={styles.userName}>{user.username}</span>
        </div>
    );
};
