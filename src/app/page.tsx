'use client';

// app/page.tsx
import { useMachines } from '@/shared/lib/contexts';
import { ActionButtons } from '@/widgets/action-buttons';
import { BuyMachineLink } from '@/widgets/by-machine-link';
import { Header } from '@/widgets/header';
import { MachineList } from '@/widgets/machine-list';
import styles from './Home.module.scss';

export default function HomePage() {
    const { machines, loading, error } = useMachines();

    if (loading) {
        return null;
    }

    if (error) {
        return <div className={styles.homePage}>Ошибка загрузки данных.</div>;
    }

    const hasPurchasedMachines = machines.some(
        (machine) => (machine.state_car?.status ?? 'not_purchased') !== 'not_purchased'
    );

    return (
        <div className={styles.homePage}>
            <Header />
            <ActionButtons />

            {hasPurchasedMachines ? (
                <div className={styles.machinesContainer}>
                    <MachineList filterType="purchased" showBuyMoreCard={true} />
                </div>
            ) : (
                <BuyMachineLink />
            )}
        </div>
    );
}
