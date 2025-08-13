import { Balance } from '@/widgets/balance';
import { User } from '@/widgets/user';
import styles from './Header.module.scss';

export const Header = () => {
    return (
        <header className={styles.header}>
            <User />
            <Balance />
        </header>
    );
};
