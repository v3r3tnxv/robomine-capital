// @/widgets/machine-card/model/types.ts
import { MachineWithState } from '@/entities/machine';

export interface MachineCardProps {
    image: string;
    price: number;
    status: 'not_purchased' | 'awaiting' | 'in_progress' | 'waiting_for_reward' | 'completed';
    isPurchased: boolean;
    machineData?: MachineWithState;
}

type ModalAction = 'purchased' | 'activated' | 'transitioned';

export interface MachineInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAction?: (action: ModalAction, machineId: number) => void;
    machine: MachineWithState;
    isPurchased: boolean;
    status: string;
}
