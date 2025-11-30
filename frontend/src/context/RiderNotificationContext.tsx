import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { NotificationService } from '../proto/notification';
import { Notification } from '../proto/notification';
import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';
import { NotificationServiceClient } from '../proto/notification.client';
import { useAuth } from './AuthContext';

interface RiderNotificationContextValue {
    lastNotification: Notification | null;
    isConnected: boolean;
    clearNotification: () => void;
}

const RiderNotificationContext = createContext<RiderNotificationContextValue | undefined>(undefined);

export const RiderNotificationProvider = ({ children }: { children: ReactNode }) => {
    const { token, role, userId } = useAuth();
    const [lastNotification, setLastNotification] = useState<Notification | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token || role !== 'RIDER' || !userId) return;

        const transport = new GrpcWebFetchTransport({
            baseUrl: 'http://localhost:8080',
            meta: { Authorization: `Bearer ${token}` }
        });

        const client = new NotificationServiceClient(transport);
        const abortController = new AbortController();

        const subscribe = async () => {
            try {
                console.log('[RiderNotificationContext] Subscribing to notifications...');
                const stream = client.subscribe({ userId }, { abort: abortController.signal });

                setIsConnected(true);

                for await (const response of stream.responses) {
                    console.log('[RiderNotificationContext] Received notification:', response);
                    setLastNotification(response);
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error('[RiderNotificationContext] Subscription error:', err);
                }
                setIsConnected(false);
            }
        };

        subscribe();

        return () => {
            console.log('[RiderNotificationContext] Unsubscribing...');
            abortController.abort();
            setIsConnected(false);
        };
    }, [token, role, userId]);

    const clearNotification = useCallback(() => {
        setLastNotification(null);
    }, []);

    return (
        <RiderNotificationContext.Provider value={{ lastNotification, isConnected, clearNotification }}>
            {children}
        </RiderNotificationContext.Provider>
    );
};

export const useRiderNotifications = () => {
    const context = useContext(RiderNotificationContext);
    if (!context) {
        throw new Error('useRiderNotifications must be used within a RiderNotificationProvider');
    }
    return context;
};
