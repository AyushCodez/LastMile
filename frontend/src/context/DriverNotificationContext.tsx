import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { MatchingService } from '../proto/matching';
import { MatchEvent } from '../proto/matching';
import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';
import { MatchingServiceClient } from '../proto/matching.client';
import { useAuth } from './AuthContext';

interface DriverNotificationContextValue {
    lastMatchEvent: MatchEvent | null;
    isConnected: boolean;
    clearMatchEvent: () => void;
}

const DriverNotificationContext = createContext<DriverNotificationContextValue | undefined>(undefined);

export const DriverNotificationProvider = ({ children }: { children: ReactNode }) => {
    const { token, role, userId } = useAuth();
    const [lastMatchEvent, setLastMatchEvent] = useState<MatchEvent | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token || role !== 'DRIVER' || !userId) return;

        const transport = new GrpcWebFetchTransport({
            baseUrl: 'http://localhost:8080',
            meta: { Authorization: `Bearer ${token}` }
        });

        const client = new MatchingServiceClient(transport);
        const abortController = new AbortController();

        const subscribe = async () => {
            try {
                console.log('[DriverNotificationContext] Subscribing to matches...');
                const stream = client.subscribeMatches({ clientId: userId }, { abort: abortController.signal });

                setIsConnected(true);

                for await (const response of stream.responses) {
                    console.log('[DriverNotificationContext] Received match event:', response);
                    // Filter out keep-alive/welcome messages that don't have a result
                    if (response.result && response.stationAreaId) {
                        setLastMatchEvent(response);
                    } else {
                        console.log('[DriverNotificationContext] Ignoring non-match event');
                    }
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error('[DriverNotificationContext] Subscription error:', err);
                }
                setIsConnected(false);
            }
        };

        subscribe();

        return () => {
            console.log('[DriverNotificationContext] Unsubscribing...');
            abortController.abort();
            setIsConnected(false);
        };
    }, [token, role, userId]);

    const clearMatchEvent = useCallback(() => {
        setLastMatchEvent(null);
    }, []);

    return (
        <DriverNotificationContext.Provider value={{ lastMatchEvent, isConnected, clearMatchEvent }}>
            {children}
        </DriverNotificationContext.Provider>
    );
};

export const useDriverNotifications = () => {
    const context = useContext(DriverNotificationContext);
    if (!context) {
        throw new Error('useDriverNotifications must be used within a DriverNotificationProvider');
    }
    return context;
};
