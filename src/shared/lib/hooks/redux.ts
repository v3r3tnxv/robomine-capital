// shared/lib/hooks/redux.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../providers/store';

// Кастомный `useDispatch`, который сразу знает про наш `store`
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Кастомный `useSelector`, который знает тип `state`
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
