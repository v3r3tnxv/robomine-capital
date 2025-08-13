import { WithdrawForm } from '@/features/withdraw';
import { BackButton } from '@/shared/ui';
import { Header } from '@/widgets/header';
import styles from './Withdraw.module.scss';

export default function WithdrawPage() {
    return (
        <div className={styles.withdrawPage}>
            <BackButton />
            <h1 className={styles.title}>Вывод средств</h1>

            <Header />

            <div className={styles.formContainer}>
                <span>Сумма для вывода</span>
                <WithdrawForm />
            </div>
        </div>
    );
}
