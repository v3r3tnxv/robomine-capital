// entities/machine/model/types.ts

// --- DTO для создания машины ---
export interface CreateMachineDto {
    name: string;
    price: number;
    status: boolean;
    lifespan: number; // срок службы в днях
    daily_replenishment: number; // ежедневное пополнение баланса
    daily_replenishment_tokens: number; // ежедневные токены
    profit_percentage: number; // процент прибыли
    image?: string; // URL изображения
}

// --- Атрибуты модели машины (из БД) ---
export interface MachineAttributes {
    id: number;
    name: string;
    price: number;
    status: boolean;
    lifespan: number;
    daily_replenishment: number;
    daily_replenishment_tokens: number;
    profit_percentage: number;
    image: string;
    created_at: Date;
    updated_at: Date;
}

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

// --- Атрибуты для создания (без id и timestamps) ---
export type MachineCreationAttributes = Optional<
    MachineAttributes,
    | 'id'
    | 'daily_replenishment_tokens'
    | 'profit_percentage'
    | 'image'
    | 'created_at'
    | 'updated_at'
>;

// --- DTO для связи машина-пользователь ---
export interface MachineToUserAttributes {
    id: number;
    telegram_id: number;
    machine_id: number;
    remaining_uses: number;
    status: 'not_purchased' | 'awaiting' | 'in_progress' | 'waiting_for_reward' | 'completed';
    last_updated: number;
    created_at: Date;
    updated_at: Date;
}

export interface PurchaseMachineDto {
    car_id: number;
}

export interface ActivateMachineDto {
    car_id: number;
}

export interface TransitionMachineDto {
    car_to_user_id: number;
}

// --- Тип для ответа getAllMachines ---
export interface MachineWithState {
    car: MachineAttributes;
    state_car: {
        id: number | null;
        telegram_id: number;
        car_id: number | null;
        remaining_uses: number;
        status: MachineToUserAttributes['status'];
        last_updated: number;
    };
}
