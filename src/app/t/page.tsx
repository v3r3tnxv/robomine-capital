'use client';

import { useEffect } from 'react';
import { useTelegram } from '@/shared/lib/hooks/auth/useTelegram';

export default function TestTelegramPage() {
    const { user, initData, telegramId, isAuthenticated, isLoading } = useTelegram();

    useEffect(() => {
        console.log('Hook result:', { user, initData, telegramId, isAuthenticated, isLoading });
    }, [user, initData, telegramId, isAuthenticated, isLoading]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Telegram Test</h1>
            <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            {telegramId && <p>Telegram ID: {telegramId}</p>}
            {initData && <p>Init Data: {initData.substring(0, 50)}...</p>}
            {user && (
                <div>
                    <p>
                        User: {user.first_name} {user.last_name}
                    </p>
                    <p>Username: {user.username}</p>
                </div>
            )}
        </div>
    );
}
