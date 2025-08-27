'use client';

// app/page.tsx
import { useEffect, useState } from 'react';
// <-- Импортируйте хуки
import { MachineWithState, getAllMachines } from '@/entities/machine';
import { MachineList } from '@/features/mining/ui/MachineList';
import { ActionButtons } from '@/widgets/action-buttons';
import { Header } from '@/widgets/header/ui/Header';
import { BuyMachineLink } from '@/widgets/machine-card';
import styles from './Home.module.scss';

export default function HomePage() {
    const [userMachines, setUserMachines] = useState<MachineWithState[]>([]);
    const [loading, setLoading] = useState(true); // Добавляем состояние загрузки
    const [error, setError] = useState<string | null>(null); // Добавляем состояние ошибки (опционально)

    useEffect(() => {
        const fetchMachines = async () => {
            try {
                setLoading(true); // Начинаем загрузку
                setError(null); // Сбрасываем ошибку перед новой попыткой
                const allMachines = await getAllMachines();
                // Фильтруем: только купленные/активные машины
                const purchasedMachines = allMachines.filter(({ state_car }) => {
                    const status = state_car?.status ?? 'not_purchased';
                    return status !== 'not_purchased';
                });
                setUserMachines(purchasedMachines);
            } catch (err) {
                console.error(
                    'Ошибка при загрузке машин пользователя для главной страницы (клиент):',
                    err
                );
                setError('Не удалось загрузить список машин.'); // Устанавливаем сообщение об ошибке
                setUserMachines([]); // Или setUserMachines(null); в зависимости от того, что вы хотите показать при ошибке
            } finally {
                setLoading(false); // Завершаем загрузку независимо от результата
            }
        };

        fetchMachines();
    }, []);

    return (
        <div className={styles.homePage}>
            <Header />
            <ActionButtons />

            {!loading && !error && (
                <>
                    {userMachines && userMachines.length > 0 ? (
                        // Если есть купленные машины — показываем их список
                        <div className={styles.machinesContainer}>
                            <MachineList
                                machines={userMachines}
                                filterType="purchased"
                                showBuyMoreCard={true}
                            />
                        </div>
                    ) : (
                        // Если купленных машин нет (и данные загружены) — показываем ссылку на магазин
                        <BuyMachineLink />
                    )}
                </>
            )}
        </div>
    );
}
