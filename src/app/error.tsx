'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/ui/button';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div>
            <h1>Ошибка</h1>
            <p>Произошла ошибка при загрузке страницы.</p>
            <Button onClick={() => reset()} className="" label="Попробовать снова" />
        </div>
    );
}
