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
        if (typeof window === 'undefined') {
            console.log('Window is undefined');
            return null;
        }

        try {
            // 1. Из URL параметров
            const urlParams = new URLSearchParams(window.location.search);
            const refParam = urlParams.get('ref');
            console.log('URL ref param:', refParam);

            if (refParam) {
                const referralId = parseInt(refParam, 10);
                if (!isNaN(referralId)) {
                    console.log('Found referral ID from URL:', referralId);
                    return referralId;
                }
            }

            // 2. Из start_param Telegram WebApp
            const telegramObj = window as unknown as MinimalTelegramWebApp;
            const startParam = telegramObj.Telegram?.WebApp?.initDataUnsafe?.start_param;
            console.log('Telegram start_param:', startParam);

            if (startParam) {
                // Поддерживаем оба формата: ref123456 и 123456
                let cleanStartParam = startParam;
                if (startParam.startsWith('ref')) {
                    cleanStartParam = startParam.substring(3);
                }

                const startParamId = parseInt(cleanStartParam, 10);
                console.log('Parsed start_param ID:', startParamId);

                if (!isNaN(startParamId)) {
                    console.log('Found referral ID from Telegram start_param:', startParamId);
                    return startParamId;
                }
            }
        } catch (error) {
            console.error('Ошибка получения referral_id:', error);
        }

        console.log('No referral ID found');
        return null;
    }, []);

    return { getReferralId };
};
