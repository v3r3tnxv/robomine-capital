'use client';

import { useUser } from '@/entities/user';
import styles from './User.module.scss';

export const User = () => {
    const { user, isLoading, error } = useUser();

    if (isLoading) {
        return <div className={styles.user}>Загрузка имени пользователя...</div>;
    }

    if (error) {
        return <div className={styles.user}>Ошибка: {error}</div>;
    }

    if (!user) {
        return <div className={styles.user}>Пользователь не найден</div>;
    }

    return (
        <div className={styles.user}>
            <span className={styles.userStatus}>{String(user.blago_status)}</span>
            <span className={styles.userName}>
                {user.username || `Пользователь ${user.telegram_id}`}
            </span>
        </div>
    );
};
