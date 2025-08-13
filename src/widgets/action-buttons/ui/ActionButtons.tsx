import Link from 'next/link';
import { Arrow, Invite } from '@/shared/assets/icons';
import styles from './ActionButtons.module.scss';

const actions = [
    {
        key: 'deposit',
        href: '/deposit',
        icon: <Arrow className={styles.icon} />,
        label: 'Пополнить',
    },
    {
        key: 'withdraw',
        href: '/withdraw',
        icon: <Arrow className={styles.icon} />,
        label: 'Вывести',
    },
    {
        key: 'referral',
        href: '/referral',
        icon: <Invite className={styles.icon} />,
        label: 'Пригласить',
    },
];

export const ActionButtons = () => {
    return (
        <div className={styles.actions}>
            {actions.map(({ key, href, icon, label }) => (
                <Link key={key} href={href} className={styles[key]}>
                    <div className={styles.iconWrapper}>{icon}</div>
                    <span className={styles.label}>{label}</span>
                </Link>
            ))}
        </div>
    );
};
