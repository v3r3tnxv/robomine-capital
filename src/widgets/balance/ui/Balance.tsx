import styles from './Balance.module.scss';

export const Balance = () => {
    return (
        <div className={styles.balance}>
            <span className={styles.balanceConvert}>999 RUB</span>
            <span className={styles.balanceMain}>999 USDT</span>
        </div>
    );
};
