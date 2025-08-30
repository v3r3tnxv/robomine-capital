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

// Вынесем функцию очистки в утилиты или сделаем локально
const cleanReferralParam = (param: string | null | undefined): number | null => {
    if (!param) return null;
    let cleanParam = param;
    if (param.startsWith('ref')) {
        cleanParam = param.substring(3);
    }
    const id = parseInt(cleanParam, 10);
    return isNaN(id) ? null : id;
};

export const useReferral = () => {
    const getReferralId = useCallback((): number | null => {
        if (typeof window === 'undefined') {
            console.log('Window is undefined');
            return null;
        }

        try {
            // 1. Из localStorage (сохраненного в useTelegramWebApp)
            const storedReferrerId = localStorage.getItem('referrer_id');
            console.log('Stored referrer_id from localStorage:', storedReferrerId);
            
          const localStorageId = cleanReferralParam(storedReferrerId);
            if (localStorageId !== null) {
                 console.log('Found referral ID from localStorage (parsed):', localStorageId);
                 return localStorageId;
            }

            // 2. Из URL параметров (резервный вариант)
            const urlParams = new URLSearchParams(window.location.search);
            const refParam = urlParams.get('ref');
            console.log('URL ref param (raw):', refParam);

            const urlId = cleanReferralParam(refParam);
            if (urlId !== null) {
                 console.log('Found referral ID from URL (parsed):', urlId);
                 return urlId;
            }

            // 3. Из start_param Telegram WebApp (если не сохранилось в localStorage)
            const telegramObj = window as unknown as MinimalTelegramWebApp;
            const startParam = telegramObj.Telegram?.WebApp?.initDataUnsafe?.start_param;
            console.log('Telegram start_param (direct, raw):', startParam);

            const startParamId = cleanReferralParam(startParam);
            if (startParamId !== null) {
                 console.log('Found referral ID from Telegram start_param (parsed):', startParamId);
                 return startParamId;
            }
        } catch (error) {
            console.error('Ошибка получения referral_id:', error);
        }

        console.log('No referral ID found');
        return null;
    }, []);

    return { getReferralId };
};
