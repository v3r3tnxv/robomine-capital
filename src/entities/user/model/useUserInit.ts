// 'use client';

// // entities/user/model/useUserInit.ts
// import { useEffect, useState } from 'react';
// import { AxiosError } from 'axios';
// import { checkUserExists, createUser, getMe } from '@/entities/user/api/user.api';
// import { CreateUserDto, UserAttributes } from '@/entities/user/model/types';
// import { useTelegramWebApp } from '@/shared/lib/hooks/useTelegramWebApp';

// // Расширяем интерфейс Window для глобальной переменной
// declare global {
//     interface Window {
//         telegramUser?: UserAttributes;
//     }
// }

// export const useUserInit = () => {
//     const [user, setUser] = useState<UserAttributes | null>(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const { tgUser, isLoading: isTgLoading } = useTelegramWebApp();

//     useEffect(() => {
//         console.log(
//             'useUserInit useEffect triggered. tgUser:',
//             tgUser,
//             'isTgLoading:',
//             isTgLoading
//         );

//         const initializeUser = async () => {
//             try {
//                 if (isTgLoading) {
//                     console.log('Telegram WebApp data is still loading (isTgLoading=true)');
//                     return;
//                 }
//                 if (!tgUser?.id) {
//                     console.warn('tgUser.id NOT found. Cannot initialize user.');
//                     setError('Не удалось получить данные пользователя из Telegram');
//                     setIsLoading(false);
//                     return;
//                 }

//                 setIsLoading(true);
//                 setError(null);

//                 // Проверяем существование пользователя
//                 const exists = await checkUserExists(tgUser.id);

//                 if (!exists) {
//                     // Создаем нового пользователя
//                     const userData: CreateUserDto = {
//                         telegram_id: tgUser.id,
//                         username: tgUser.username || `user_${tgUser.id}`,
//                     };
//                     try {
//                         const newUser = await createUser(userData);
//                         setUser(newUser);
//                         // Сохраняем данные пользователя в глобальную переменную (если нужно)
//                         if (typeof window !== 'undefined') {
//                             window.telegramUser = newUser;
//                         }
//                     } catch (createError: unknown) {
//                         // Обрабатываем 409 Conflict - пользователь уже существует
//                         if (
//                             createError instanceof AxiosError &&
//                             createError.response?.status === 409
//                         ) {
//                             const userData = await getMe();
//                             setUser(userData);
//                             // Сохраняем данные пользователя в глобальную переменную (если нужно)
//                             if (typeof window !== 'undefined') {
//                                 window.telegramUser = userData;
//                             }
//                         } else {
//                             // Другая ошибка - пробрасываем её дальше
//                             throw createError;
//                         }
//                     }
//                 } else {
//                     // Пользователь существует, получаем данные
//                     const userData = await getMe();
//                     setUser(userData);
//                     // Сохраняем данные пользователя в глобальную переменную (если нужно)
//                     if (typeof window !== 'undefined') {
//                         window.telegramUser = userData;
//                     }
//                 }
//             } catch (err: unknown) {
//                 console.error('Ошибка инициализации пользователя:', err);
//                 if (err instanceof Error) {
//                     setError(`Ошибка инициализации: ${err.message}`);
//                 } else {
//                     setError('Неизвестная ошибка инициализации');
//                 }
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         initializeUser();
//     }, [tgUser, isTgLoading]);

//     return { user, isLoading, error };
// };
