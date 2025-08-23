'use client';

import { useUser } from '@/entities/user';
import styles from './User.module.scss';

export const User = () => {
    const { user } = useUser();

    if (!user) {
        return <div className={styles.user}>Не удалось загрузить имя пользователя</div>;
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
