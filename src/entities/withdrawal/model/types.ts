// entities/withdrawal/model/types.ts
type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

// --- Атрибуты модели вывода (из БД) ---
export interface WithdrawalAttributes {
    id: number;
    telegram_id: number;
    hash: string;
    amount: number;
    status: 'pending' | 'pending_confirmation' | 'completed' | 'rejected';
    created_at: Date;
    updated_at: Date;
}

// --- Атрибуты для создания (без id и timestamps) ---
export type WithdrawalCreationAttributes = Optional<
    WithdrawalAttributes,
    'id' | 'created_at' | 'updated_at'
>;

// --- DTO для создания вывода ---
export interface CreateWithdrawalDto {
    amount: string; // Сумма как строка, как в бэкенде
    spend_id?: string; // Опционально, генерируется бэкендом если не передан
    comment?: string;
    disable_send_notification?: boolean;
}

// --- DTO для подтверждения/отклонения вывода (админ) ---
export interface ProcessWithdrawalDto {
    id: number;
}

// --- Тип для ограничений на вывод ---
export interface WithdrawalRestriction {
    message: string;
    availableDays?: string[]; // Только если есть ограничения по времени
}

// --- Тип для списка ожидающих выводов (админ) ---
export type PendingWithdrawal = WithdrawalAttributes;

// --- Тип для ответа transfer (основная операция) ---
export type TransferResult = WithdrawalAttributes;
