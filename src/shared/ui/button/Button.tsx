import clsx from 'clsx';
import styles from './Button.module.scss';
import { ButtonProps } from './types';

export const Button = ({
    label,
    onClick,
    disabled = false,
    variant = 'primary',
    children,
    className,
    ...props
}: ButtonProps) => {
    const variantClass = styles[`button${variant[0].toUpperCase() + variant.slice(1)}`];

    return (
        <button
            className={clsx(styles.button, variantClass, className, {
                [styles.disabled]: disabled,
            })}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
            {label}
        </button>
    );
};
