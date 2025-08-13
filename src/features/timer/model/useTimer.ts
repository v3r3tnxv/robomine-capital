// 'use client';

// import { useEffect, useState } from 'react';

// export const useTimer = (targetTimestamp: number | null) => {
//     const [timeLeft, setTimeLeft] = useState(() => {
//         if (!targetTimestamp) return 0;
//         return Math.max(0, targetTimestamp - Math.floor(Date.now() / 1000));
//     });

//     useEffect(() => {
//         const interval = setInterval(() => {
//             setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
//         }, 1000);
//         return () => clearInterval(interval);
//     }, []);

//     return timeLeft;
// };
