// src/shared/ui/MaintenanceScreen/MaintenanceScreen.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './MaintenanceScreen.module.scss';

// src/shared/ui/MaintenanceScreen/MaintenanceScreen.tsx

// src/shared/ui/MaintenanceScreen/MaintenanceScreen.tsx

// src/shared/ui/MaintenanceScreen/MaintenanceScreen.tsx

export const MaintenanceScreen: React.FC = () => {
    // Список сообщений о процессе технических работ, тематических для майнинга
    const maintenanceMessages = [
        'Проверяем работоспособность майнинг-ферм...',
        'Обновляем прошивку оборудования...',
        'Запускаем диагностику ASIC чипов...',
        'Оптимизируем алгоритмы майнинга...',
        'Настраиваем охлаждение систем...',
        'Заряжаем майнинг-машины...',
        'Синхронизируем с блокчейном...',
        'Проверяем подключение к пулам...',
        'Калибруем энергопотребление...',
        'Загружаем последние обновления...',
        'Готовим роботов-операторов...',
        'Подготавливаем награды для пользователей...',
        'Финальная проверка систем...',
    ];

    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    // Циклическая смена сообщений
    useEffect(() => {
        const messageInterval = setInterval(() => {
            setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % maintenanceMessages.length);
        }, 3000); // Меняем сообщение каждые 3 секунды

        return () => clearInterval(messageInterval);
    }, [maintenanceMessages.length]);

    // Анимация прогресс-бара (имитация работы)
    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev + Math.random() * 5; // Случайный прирост
                if (newProgress >= 100) {
                    setIsCompleted(true);
                    clearInterval(progressInterval);
                    return 100;
                }
                return newProgress;
            });
        }, 500);

        return () => clearInterval(progressInterval);
    }, []);

    return (
        <div className={styles.maintenanceScreen}>
            <div className={styles.content}>
                {/* Анимированный робот-механик */}
                <div className={styles.robotContainer}>
                    <Image
                        src="/images/mascot.webp" // Используй подходящее изображение
                        alt="Робот-механик"
                        width={120}
                        height={120}
                        className={styles.robot}
                        priority
                    />
                    {/* Иконки процесса вокруг робота */}
                    <div className={styles.processIcons}>
                        <span className={styles.icon1}>⚙️</span>
                        <span className={styles.icon2}>⚡</span>
                        <span className={styles.icon3}>🛠️</span>
                    </div>
                </div>

                {/* Заголовок */}
                <h1 className={styles.title}>
                    <span className={styles.highlight}>Технические работы</span>
                </h1>

                {/* Динамическое сообщение о процессе */}
                <div className={styles.messageContainer}>
                    <p className={styles.message}>{maintenanceMessages[currentMessageIndex]}</p>
                    <div className={styles.typingIndicator}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>

            {/* Анимированный фон */}
            <div className={styles.animatedBackground}>
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className={styles.floatingElement}
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${15 + Math.random() * 10}s`,
                        }}
                    >
                        {['⛏️', '⚡', '💻', '🔧', '⚙️'][Math.floor(Math.random() * 5)]}
                    </div>
                ))}
            </div>
        </div>
    );
};
