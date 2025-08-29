// entities/machine/lib/status.ts
import { MachineToUserAttributes } from '../model/types';

export const getMachineStatus = (status: MachineToUserAttributes['status']) => {
    switch (status) {
        case 'not_purchased':
            return {
                isPurchased: false,
                displayStatus: 'not_purchased' as const,
            };
        case 'awaiting':
            return {
                isPurchased: true,
                displayStatus: 'awaiting' as const,
            };
        case 'in_progress':
            return {
                isPurchased: true,
                displayStatus: 'in_progress' as const,
            };
        case 'waiting_for_reward':
            return {
                isPurchased: true,
                displayStatus: 'waiting_for_reward' as const,
            };
        case 'completed':
            return {
                isPurchased: true,
                displayStatus: 'completed' as const,
            };
        default:
            return {
                isPurchased: false,
                displayStatus: 'not_purchased' as const,
            };
    }
};

export const getMachineActionText = (
    isPurchased: boolean,
    status: MachineToUserAttributes['status'],
    isProcessing: boolean,
    isCollectingReward: boolean
) => {
    if (!isPurchased) return 'Купить';

    switch (status) {
        case 'awaiting':
            return 'Активировать';
        case 'in_progress':
            return isProcessing ? 'Активация...' : 'Активировано';
        case 'waiting_for_reward':
            return isCollectingReward ? 'Получение...' : 'Забрать';
        case 'completed':
            return 'Купить';
        default:
            return 'Куплена';
    }
};
