import { MachineList } from '@/features/mining';
import { BackButton } from '@/shared/ui';
import styles from './Shop.module.scss';

export default function ShopPage() {
    return (
        <div className={styles.shopPage}>
            <BackButton />
            <h1 className={styles.title}>Майнинг машины</h1>
            <MachineList />
        </div>
    );
}
