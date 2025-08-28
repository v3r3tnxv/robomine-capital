// @/app/shop/page.tsx
import { BackButton } from '@/shared/ui';
import { MachineList } from '@/widgets/machine-list';
import styles from './Shop.module.scss';

export default function ShopPage() {
    return (
        <div className={styles.shopPage}>
            <BackButton />
            <h1 className={styles.title}>Майнинг машины</h1>
            <MachineList filterType="not_purchased" showBuyMoreCard={false} />
        </div>
    );
}
