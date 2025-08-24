'use client';

// src/widgets/balance/ui/Balance.tsx
import { useUser } from '@/entities/user/model/UserContext';
import { convertCurrency, useCurrencyConverter } from '@/features/currency-converter';
import styles from './Balance.module.scss';

export const Balance = () => {
    const { user } = useUser();
    const { rates } = useCurrencyConverter();

    const userBalance =
        user?.balance !== undefined && user?.balance !== null ? Number(user.balance) : 0;

    const balanceRub = rates
        ? convertCurrency({
              amount: userBalance,
              from: 'USDT',
              to: 'RUB',
              rates: rates,
          })
        : 0;

    const formattedBalanceRub = balanceRub.toFixed(3);
    const formattedBalanceUSDT = userBalance.toFixed(3);

    return (
        <div className={styles.balance}>
            <span className={styles.balanceConvert}>{formattedBalanceRub} RUB</span>
            <span className={styles.balanceMain}>{formattedBalanceUSDT} USDT</span>
        </div>
    );
};
