import { DepositForm } from '@/features/deposit';
import { BackButton } from '@/shared/ui';
import { Header } from '@/widgets/header';
import styles from './Deposit.module.scss';

export default function DepositPage() {
    return (
        <div className={styles.depositPage}>
            <BackButton />
            <h1 className={styles.title}>Пополнение баланса</h1>
            <Header />
            <div className={styles.formContainer}>
                <span>Сумма для пополнения</span>
                <DepositForm />
            </div>
        </div>
    );
}
