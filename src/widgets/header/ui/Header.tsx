import { User } from '@/widgets/user';
import { UserBalance } from '@/widgets/user-balance';
import styles from './Header.module.scss';

export const Header = () => {
    return (
        <header className={styles.header}>
            <User />
            <UserBalance />
        </header>
    );
};
