// @/widgets/machine-card/model/types.ts
import { MachineWithState } from '@/entities/machine';

type CardAction = 'purchased' | 'activated' | 'transitioned';
export interface MachineCardProps {
    image: string;
    price: number;
    status: 'not_purchased' | 'awaiting' | 'in_progress' | 'waiting_for_reward' | 'completed';
    isPurchased: boolean;
    onAction?: (action: CardAction, machineId: number) => void;
    machineData?: MachineWithState;
    machine: MachineWithState;
}

export interface MachineInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    machine: MachineWithState;
    status: string;
}
