import { getMe } from '@/entities/user/api/user.api';
import { UserProfile } from '@/entities/user/model/types';
import styles from './User.module.scss';

// Асинхронный Server Component
export const User = async () => {
    let user: UserProfile | null = null;
    let error: string | null = null;

    try {
        // Вызов API происходит на сервере во время рендеринга
        user = await getMe();
    } catch (err) {
        console.error('Ошибка при загрузке данных пользователя:', err);
        // В production лучше логировать в Sentry или аналогичную систему
        error = 'Не удалось загрузить данные пользователя';
    }

    if (error) {
        return <div className={styles.user}>{error}</div>;
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
