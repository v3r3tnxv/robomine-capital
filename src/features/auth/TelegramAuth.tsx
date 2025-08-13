// 'use client';

// // features/auth/TelegramAuth.tsx
// import { useEffect } from 'react';
// import { useTelegram } from '@/shared/lib/hooks/auth/useTelegram';

// export const TelegramAuth = () => {
//     const user = useTelegram();

//     useEffect(() => {
//         if (user?.id) {
//             document.cookie = `telegramId=${user.id}; path=/;`;
//         }
//     }, [user]);

//     return null;
// };
