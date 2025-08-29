import React from 'react';
import styles from './MaintenanceScreen.module.scss';

export const MaintenanceScreen: React.FC = () => {
  return (
    <div className={styles.maintenanceScreen}>
      <div className={styles.content}>
        <div className={styles.icon}>⚙️</div>
        <h1 className={styles.title}>Технические работы</h1>
        <p className={styles.message}>
          Мы настраиваем и улучшаем наш сервис для вас. 
          Пожалуйста, зайдите немного позже.
        </p>
        <div className={styles.spinner}></div>
      </div>
    </div>
  );
};