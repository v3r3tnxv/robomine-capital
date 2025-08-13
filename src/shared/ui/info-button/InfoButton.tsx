import clsx from 'clsx';
import '@/shared/assets/icons';
import { Info } from '@/shared/assets/icons';
import styles from './InfoButton.module.scss';
import { InfoButtonProps } from './types';

export const InfoButton = ({ onClick, className }: InfoButtonProps) => {
    return (
        <button
            type="button"
            className={clsx(styles.infoButton, className)}
            onClick={onClick}
            title="Подробнее"
            aria-label="Подробнее"
        >
            <Info className={styles.icon} />
        </button>
    );
};
