import Link from 'next/link';
import { MachineWithState, getAllMachines } from '@/entities/machine';
import { MachineList } from '@/features/mining/ui/MachineList';
import { ActionButtons } from '@/widgets/action-buttons';
import { Header } from '@/widgets/header/ui/Header';
import { BuyMachineLink } from '@/widgets/machine-card';
import { UserInitializer } from '@/widgets/user-initializer/ui/UserInitializer';
import styles from './Home.module.scss';

export default async function HomePage() {
    let userMachines: MachineWithState[] = [];
    let error = null;

    try {
        const allMachines = await getAllMachines();
        // Фильтруем: только купленные/активные машины
        userMachines = allMachines.filter(({ state_car }) => {
            const status = state_car?.status ?? 'not_purchased';
            return status !== 'not_purchased';
        });
    } catch (err) {
        console.error('Ошибка при загрузке машин пользователя для главной страницы:', err);
        error = 'Не удалось загрузить список ваших машин.';
    }

    return (
        <UserInitializer>
            {({ isLoading, error: userError }) => (
                <div className={styles.homePage}>
                    <Header />
                    <ActionButtons />

                    {/* Показываем состояние инициализации пользователя */}
                    {isLoading && <div>Инициализация пользователя...</div>}
                    {userError && <div>Ошибка: {userError}</div>}

                    <Link href={'/t'}>перейти на тест</Link>

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
            )}
        </UserInitializer>
    );
}
