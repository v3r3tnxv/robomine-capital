// import { useEffect, useState } from 'react';
// import moleCoin from '@/assets/icons/mole-coin.webp';
// import tonCoin from '@/assets/icons/ton-coin.webp';
// import './ClaimAnimation.scss';

// const getRandomCoin = () => (Math.random() > 0.5 ? tonCoin : moleCoin);

// export const ClaimAnimation = () => {
//     const [shouldAnimateCoins, setShouldAnimateCoins] = useState(false);
//     const [coinType, setcoinType] = useState<string[]>([]);

//     useEffect(() => {
//         setcoinType([
//             getRandomCoin(),
//             getRandomCoin(),
//             getRandomCoin(),
//             getRandomCoin(),
//             getRandomCoin(),
//         ]);
//         setShouldAnimateCoins(true);
//     }, []);

//     return (
//         <div className="ClaimAnimation">
//             <img className={`Coin Coin_Central`} src={tonCoin} alt="coin" />
//             <img
//                 className={`Coin Coin_TopLeft ${shouldAnimateCoins ? 'animate' : ''}`}
//                 src={coinType[0]}
//                 alt="coin"
//             />
//             <img
//                 className={`Coin Coin_TopRight ${shouldAnimateCoins ? 'animate' : ''}`}
//                 src={coinType[1]}
//                 alt="coin"
//             />
//             <img
//                 className={`Coin Coin_BottomRight ${shouldAnimateCoins ? 'animate' : ''}`}
//                 src={coinType[2]}
//                 alt="coin"
//             />
//             <img
//                 className={`Coin Coin_BottomLeft ${shouldAnimateCoins ? 'animate' : ''}`}
//                 src={coinType[3]}
//                 alt="coin"
//             />
//         </div>
//     );
// };
