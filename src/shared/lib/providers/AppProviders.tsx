'use client';

// app/appProviders.tsx
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from '@/entities/user';
import { MachineProvider } from '../contexts/MachineContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <UserProvider>
                <MachineProvider>{children}</MachineProvider>
            </UserProvider>
        </QueryClientProvider>
    );
}
