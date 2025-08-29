// src/shared/lib/hooks/useReferral.ts
import { useCallback } from 'react';

// Создаем минимальный тип только для нужных нам полей
interface MinimalTelegramWebApp {
    Telegram?: {
        WebApp?: {
            initDataUnsafe?: {
                start_param?: string;
            };
        };
    };
}

export const useReferral = () => {
    const getReferralId = useCallback((): number | null => {
        if (typeof window === 'undefined') return null;

        try {
            // 1. Из URL параметров
            const urlParams = new URLSearchParams(window.location.search);
            const refParam = urlParams.get('ref');
            if (refParam) {
                const referralId = parseInt(refParam, 10);
                if (!isNaN(referralId)) {
                    return referralId;
                }
            }

            // 2. Из start_param Telegram WebApp
            // Используем минимальную типизацию
            const telegramObj = window as unknown as MinimalTelegramWebApp;
            const startParam = telegramObj.Telegram?.WebApp?.initDataUnsafe?.start_param;
            if (startParam) {
                const startParamId = parseInt(startParam.replace('ref', ''), 10);
                if (!isNaN(startParamId)) {
                    return startParamId;
                }
            }
        } catch (error) {
            console.error('Ошибка получения referral_id:', error);
        }

        return null;
    }, []);

    return { getReferralId };
};
