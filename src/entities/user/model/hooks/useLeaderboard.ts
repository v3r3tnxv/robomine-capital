'use client';

// entities/user/model/hooks/useLeaderboard.ts
import { useEffect, useState } from 'react';
import { getLeaderboard } from '../../api/getLeaderboard';
import type { User } from '../types';

export const useLeaderboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getLeaderboard()
            .then(setUsers)
            .catch((e) => setError(e.message || 'Ошибка загрузки рейтинга'))
            .finally(() => setLoading(false));
    }, []);

    return { users, loading, error };
};
