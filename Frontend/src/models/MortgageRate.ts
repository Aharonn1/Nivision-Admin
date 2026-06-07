// src/models/MortgageRate.ts
export interface MortgageRate {
    id: number | string;
    sector: string;
    period: string;
    averageRate: number;
    updateMonth: string;
}