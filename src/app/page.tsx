'use client'; 
// app/page.tsx
import { useEffect, useState } from 'react'; // <-- Импортируйте хуки
import { MachineWithState, getAllMachines } from '@/entities/machine';
import { MachineList } from '@/features/mining/ui/MachineList';
import { ActionButtons } from '@/widgets/action-buttons';
import { Header } from '@/widgets/header/ui/Header';
import { BuyMachineLink } from '@/widgets/machine-card';
import styles from './Home.module.scss';

export default function HomePage() { // <-- Уберите async
    const [userMachines, setUserMachines] = useState<MachineWithState[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMachines = async () => {
            try {
                const allMachines = await getAllMachines();
                // Фильтруем: только купленные/активные машины
                const purchasedMachines = allMachines.filter(({ state_car }) => {
                    const status = state_car?.status ?? 'not_purchased';
                    return status !== 'not_purchased';
                });
                setUserMachines(purchasedMachines);
            } catch (err) {
                console.error('Ошибка при загрузке машин пользователя для главной страницы (клиент):', err);
                setError('Не удалось загрузить список ваших машин.');
            } finally {
                setLoading(false);
            }
        };

        fetchMachines();
    }, []); // Пустой массив зависимостей означает, что эффект запустится только один раз после монтирования

    // Рендеринг в зависимости от состояния
    if (loading) {
        return (
            <div className={styles.homePage}>
                <Header />
                <ActionButtons />
                <div className={styles.loadingMessage}>Загрузка...</div>
            </div>
        );
    }

    return (
        <div className={styles.homePage}>
            <Header />
            <ActionButtons />

            {error ? (
                <div className={styles.errorMessage}>{error}</div>
            ) : userMachines.length > 0 ? (
                // Если есть купленные машины — показываем их список
                <div className={styles.machinesContainer}>
                    <MachineList
                        machines={userMachines}
                        filterType="purchased"
                        showBuyMoreCard={true}
                    />
                </div>
            ) : (
                // Если купленных машин нет — показываем ссылку на магазин
                <BuyMachineLink />
            )}
        </div>
    );
}