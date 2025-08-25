'use client';

// src/widgets/balance/ui/Balance.tsx
import CountUp from 'react-countup';
import { useUser } from '@/entities/user/model/UserContext';
import { convertCurrency, useCurrencyConverter } from '@/features/currency-converter';
import styles from './ReferralBalance.module.scss';

export const ReferralBalance = () => {
    const { user } = useUser();
    const { rates } = useCurrencyConverter();

    const userBalance =
        user?.referrer_profit !== undefined && user?.referrer_profit !== null
            ? Number(user.referrer_profit)
            : 0;

    const balanceRub = rates
        ? convertCurrency({
              amount: userBalance,
              from: 'USDT',
              to: 'RUB',
              rates: rates,
          })
        : 0;

    const formattedBalanceRub = balanceRub.toFixed(2);
    const formattedBalanceUSDT = userBalance.toFixed(2);

    return (
        <div className={styles.balance}>
            <div className={styles.balanceRUB}>
                <CountUp
                    end={parseFloat(formattedBalanceRub)}
                    decimals={2}
                    duration={1}
                    separator=" "
                    decimal="."
                    prefix=""
                    suffix=""
                />
                <span>RUB</span>
            </div>
            <div className={styles.balanceUSDT}>
                <CountUp
                    end={parseFloat(formattedBalanceUSDT)} // Преобразуем в число
                    decimals={2}
                    duration={1} // Продолжительность анимации в секундах
                    separator=" " // Разделитель тысяч (если нужно)
                    decimal="."
                    prefix="" // Префикс (если нужен, например, "$")
                    suffix=" "
                    className={styles.value}
                />
                <span>USDT</span>
            </div>
        </div>
    );
};
