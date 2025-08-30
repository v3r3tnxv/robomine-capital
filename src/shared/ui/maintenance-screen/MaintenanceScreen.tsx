'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatedBackground } from './AnimatedBackground';
import styles from './MaintenanceScreen.module.scss';

export const MaintenanceScreen: React.FC = () => {
    // Список сообщений о процессе технических работ, тематических для майнинга
    const maintenanceMessages = [
        'Проверяем майнинг-фермы...',
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
        'Подготавливаем награды...',
        'Тестируем стабильность сети...',
        'Проверяем температуру GPU...',
        'Оптимизируем энергоэффективность...',
        'Проверяем целостность данных...',
        'Настраиваем вентиляцию серверов...',
        'Проверяем напряжение питания...',
        'Калибруем вентиляторы...',
        'Оптимизируем конфигурацию майнеров...',
        'Проверяем работу блокчейн-нод...',
        'Анализируем эффективность алгоритмов...',
        'Тестируем отказоустойчивость систем...',
        'Проверяем уровень шума оборудования...',
        'Обновляем драйверы видеокарт...',
        'Настраиваем автоматический перезапуск...',
        'Проверяем мониторинг систем...',
        'Оптимизируем распределение нагрузки...',
        'Наносим термопасту...',
        'Проверяем работу ASIC контроллеров...',
        'Анализируем статистику майнинга...',
        'Тестируем резервные системы...',
        'Проверяем работу охлаждающих жидкостей...',
        'Обновляем микрокод процессоров...',
        'Настраиваем систему уведомлений...',
        'Проверяем работу сетевых коммутаторов...',
        'Оптимизируем использование памяти...',
        'Калибруем датчики температуры...',
        'Проверяем работу блоков питания...',
        'Анализируем эффективность охлаждения...',
        'Тестируем системы резервного копирования...',
        'Проверяем работу шахт майнинга...',
        'Обновляем протоколы безопасности...',
        'Настраиваем систему автоматической диагностики...',
        'Проверяем работу систем мониторинга...',
        'Оптимизируем параметры overclocking...',
        'Калибруем системы энергоснабжения...',
        'Проверяем работу систем вентиляции...',
        'Анализируем производительность пулов...',
    ];

    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const contentRef = useRef<HTMLDivElement>(null);
    const usedIndices = useRef<Set<number>>(new Set());

    // Функция для получения случайного индекса, отличного от текущего
    const getRandomIndex = useCallback((currentIndex: number, maxLength: number): number => {
        if (maxLength <= 1) return 0;

        // Если все сообщения уже были показаны, сбрасываем
        if (usedIndices.current.size >= maxLength) {
            usedIndices.current.clear();
        }

        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * maxLength);
        } while (newIndex === currentIndex && maxLength > 1);

        usedIndices.current.add(newIndex);
        return newIndex;
    }, []);

    // Циклическая смена сообщений (рандомная)
    useEffect(() => {
        const messageInterval = setInterval(() => {
            setCurrentMessageIndex((prevIndex) =>
                getRandomIndex(prevIndex, maintenanceMessages.length)
            );
        }, 3000);

        return () => clearInterval(messageInterval);
    }, [maintenanceMessages.length, getRandomIndex]);

    // Обработчики drag and drop с useCallback для правильных зависимостей
    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return;

            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        },
        [isDragging, dragStart]
    );

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            // Плавный возврат в исходное положение
            setPosition({ x: 0, y: 0 });
        }
    }, [isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    // Добавляем глобальные обработчики событий
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div className={styles.maintenanceScreen}>
            {/* Анимированный фон */}
            <AnimatedBackground />

            <div
                className={styles.content}
                ref={contentRef}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging
                        ? 'none'
                        : 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
                    cursor: isDragging ? 'grabbing' : 'grab',
                }}
                onMouseDown={handleMouseDown}
            >
                <div className={styles.glassFilter}></div>
                <div className={styles.glassOverlay}></div>
                <div className={styles.glassSpecular}></div>

                {/* Анимированный робот-механик */}
                <div className={styles.robotContainer}>
                    <Image
                        src="/images/mascot.webp"
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
                <p className={styles.message}>{maintenanceMessages[currentMessageIndex]}</p>
            </div>

            <svg className={styles.svg}>
                <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.008 0.008"
                        numOctaves="2"
                        seed="92"
                        result="noise"
                    />
                    <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="blurred"
                        scale="70"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </svg>
        </div>
    );
};
