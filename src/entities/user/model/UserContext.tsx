'use client';

// src/shared/lib/contexts/UserContext.tsx
import React, { ReactNode, createContext, useContext } from 'react';
import { UserProfile, useUserInit } from '@/entities/user';

interface UserContextType {
    user: UserProfile | null;
    isLoading: boolean;
    error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const { user, isLoading, error } = useUserInit();

    return (
        <UserContext.Provider value={{ user, isLoading, error }}>{children}</UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
