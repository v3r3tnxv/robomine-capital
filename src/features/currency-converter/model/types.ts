// @/features/currency-converter/model/types.ts
export interface CurrencyRates {
    [key: string]: number;
}

export interface ConvertCurrencyParams {
    amount: number;
    from: string;
    to: string;
    rates: CurrencyRates;
}
