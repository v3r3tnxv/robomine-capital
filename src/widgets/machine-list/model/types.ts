import { MachineWithState } from '@/entities/machine';

export interface MachineListProps {
    machines?: MachineWithState[];
    filterType: 'purchased' | 'not_purchased' | 'all';
    showBuyMoreCard: boolean;
}
