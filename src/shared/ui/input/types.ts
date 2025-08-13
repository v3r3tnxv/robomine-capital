// @/shared/ui/input/types.ts
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    variant?: 'default' | 'balance'; // Добавляем вариант
    currency?: string; // Валюта для баланса
}
