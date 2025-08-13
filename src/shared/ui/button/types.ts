export type Buttonvariant = 'primary' | 'secondary' | 'switch' | 'info' | 'outline';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
    children?: React.ReactNode;
    variant?: Buttonvariant;
    className?: string;
}
