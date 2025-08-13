export interface User {
    id: number;
    telegramId: number;
    refId: number;
    username: string;
    role: string;
    balanceMain: number;
    balanceCoin: number;
    lastRewardCollectedAt: string;
    nextRewardAvailableAt: string;
    winCount: number;
    wins: number;
    matchIds: number[];
    referralCount: number;
    referrals: string[];

    // nickname: string;
    // avatar: string;
    // tonBalance: number;
    // gtnBalance: number;
    // rating: number;
}
