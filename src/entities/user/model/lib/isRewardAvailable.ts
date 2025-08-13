export const isRewardAvailable = (nextRewardAt: number | null): boolean => {
    if (!nextRewardAt) return true;
    return Date.now() / 1000 >= nextRewardAt;
};
