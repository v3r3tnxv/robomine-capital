import styles from './User.module.scss';

export const User = () => {
    return (
        <div className={styles.user}>
            <span className={styles.userStatus}>Status</span>
            <span className={styles.userName}>User</span>
        </div>
    );
};
