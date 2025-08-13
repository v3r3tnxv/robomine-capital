'use client';

// entities/user/model/hooks/useProfile.ts
import { useEffect, useState } from 'react';
import { getProfile } from '../../api';
import type { User } from '../types';

export const useProfile = (telegramId: number) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getProfile(telegramId);
                setUser(data);
            } catch (e: unknown) {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError('Неизвестная ошибка');
                }
            } finally {
                setLoading(false);
            }
        };

        if (telegramId) {
            load();
        }
    }, [telegramId]);

    return { user, loading, error };
};
