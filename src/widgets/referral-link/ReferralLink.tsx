'use client';

// @/shared/ui/referral-link/ReferralLink.tsx
import { useState } from 'react';
import { Copy } from '@/shared/assets/icons';
import { Input } from '@/shared/ui';
import styles from './ReferralLink.module.scss';

// Добавляем пропс для telegramId
interface ReferralLinkProps {
    telegramId: number; // Или string, если у вас строка
}

export const ReferralLink = ({ telegramId }: ReferralLinkProps) => {
    // Создаем состояние для отображения "Скопировано!"
    const [copied, setCopied] = useState(false);

    // Генерируем реальную реферальную ссылку
    // Замените 'your_bot_username' на имя вашего бота
    const referralLink = `https://t.me/RoboMine_CapitalBot?start=${telegramId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink).then(() => {
            setCopied(true);
            // Через 2 секунды возвращаем надпись "Копировать"
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className={styles.referralLinkWrapper}>
            <button
                className={styles.referralLink}
                onClick={handleCopy}
                aria-label={copied ? 'Ссылка скопирована' : 'Копировать реферальную ссылку'}
                type="button"
            >
                <Input
                    className={styles.input}
                    type="text"
                    variant="default"
                    placeholder="Реферальная ссылка"
                    value={referralLink}
                    readOnly
                />
                {/* Отображаем разный текст в зависимости от состояния */}
                {copied ? (
                    <span className={styles.copyText}>Скопировано!</span>
                ) : (
                    <Copy className={styles.copyIcon} />
                )}
            </button>
        </div>
    );
};
