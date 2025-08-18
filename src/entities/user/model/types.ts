// entities/user/model/types.ts
type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

// --- Атрибуты модели пользователя (из БД) ---
export interface UserAttributes {
    id: number;
    telegram_id: number;
    ref_id: number;
    role: string;
    username: string;
    balance: number;
    tokens: number;
    ref_balance: number;
    referrer_profit: number;
    blago_status: boolean;
    level: number;
    subscription: boolean;
    is_banned: boolean;
    ban_until: Date;
    created_at: Date;
    updated_at: Date;
}

// --- Атрибуты для создания (без id и timestamps) ---
export type UserCreationAttributes = Optional<
    UserAttributes,
    | 'id'
    | 'role'
    | 'username'
    | 'balance'
    | 'tokens'
    | 'ref_balance'
    | 'referrer_profit'
    | 'blago_status'
    | 'level'
    | 'subscription'
    | 'is_banned'
    | 'ban_until'
    | 'created_at'
    | 'updated_at'
>;

// --- DTO для создания пользователя ---
export interface CreateUserDto {
    telegram_id: number;
    username: string;
    ref_id?: number;
    tokens?: number;
}

// --- DTO для пополнения баланса ---
export interface ReplenishDto {
    telegram_id: number;
    amount: number;
}

// --- DTO для бана/разбана ---
export interface BanUserDto {
    date?: string; // Формат: "HH:mm DD.MM.YYYY"
}

// --- Тип для ответа getUserReferrals ---
export interface UserReferralData {
    referrals: Omit<UserAttributes, 'ban_until' | 'created_at' | 'updated_at'>[];
    referralCount: number;
}

// --- Тип для ответа getMe (предполагаем, что это расширенные данные пользователя) ---
// Вам, возможно, нужно будет адаптировать это под реальный ответ от UserService.getMe
export interface UserProfile {
    id: number;
    telegram_id: number;
    username: string;
    balance: number;
    tokens: number;
    ref_balance: number;
    referrer_profit: number;
    blago_status: boolean;
    level: number;
    subscription: boolean;
    is_banned: boolean;
    // Добавьте другие поля, которые возвращает LevelToUserService.updateUserLevel
}
