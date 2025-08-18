// entities/deposit/model/types.ts
export interface DepositDto {
    id: number;
    telegram_id: number;
    invoice_id: number;
    hash: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    created_at: string; // ISO string
    updated_at: string; // ISO string
}
