import { useState, useEffect, useMemo, useCallback } from 'react';
import type { RpcOptions } from '@protobuf-ts/runtime-rpc';
import { riderClient, stationClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useRiderNotifications } from '../context/RiderNotificationContext';
import { Area } from '../proto/common';
import { RideStatus } from '../proto/rider';
import { Timestamp } from '../proto/google/protobuf/timestamp';
import { RideRequestForm } from './rider/components/RideRequestForm';
import { RideHistoryList } from './rider/components/RideHistoryList';

type ToastState = {
    type: 'success' | 'error';
    message: string;
} | null;

export const RiderDashboard = () => {
    const { token, userId } = useAuth();
    const { lastNotification, clearNotification } = useRiderNotifications();

    const rpcOptions = useMemo<RpcOptions | undefined>(() => (
        token ? { meta: { Authorization: `Bearer ${token}` } } : undefined
    ), [token]);

    const [areas, setAreas] = useState<Area[]>([]);
    const [rides, setRides] = useState<RideStatus[]>([]);
    const [loading, setLoading] = useState({
        areas: true,
        history: true,
        request: false
    });

    const [toast, setToast] = useState<ToastState>(null);

    // Load Data
    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            try {
                // Fetch areas
                const { response: areaResponse } = await stationClient.listAreas({});
                if (mounted) {
                    setAreas(areaResponse.items);
                    setLoading(prev => ({ ...prev, areas: false }));
                }

                // Fetch history if user exists
                if (userId) {
                    const { response: historyResponse } = await riderClient.getRideHistory({ userId }, rpcOptions);
                    if (mounted) {
                        setRides(historyResponse.rides);
                        setLoading(prev => ({ ...prev, history: false }));
                    }
                }
            } catch (err) {
                console.error('Failed to load dashboard data', err);
                if (mounted) {
                    setToast({ type: 'error', message: 'Failed to load dashboard data' });
                    setLoading(prev => ({ ...prev, areas: false, history: false }));
                }
            }
        };

        loadData();
        return () => { mounted = false; };
    }, [userId, rpcOptions]);

    // Refresh History
    const refreshHistory = useCallback(async () => {
        if (!userId) return;
        try {
            const { response } = await riderClient.getRideHistory({ userId }, rpcOptions);
            setRides(response.rides);
        } catch (err) {
            console.error('Failed to refresh history', err);
        }
    }, [userId, rpcOptions]);

    // Real-time Updates
    useEffect(() => {
        if (lastNotification) {
            console.log('Received notification, refreshing history...', lastNotification);
            refreshHistory();
            setToast({ type: 'success', message: `Update: ${lastNotification.body}` });
            clearNotification();
        }
    }, [lastNotification, refreshHistory, clearNotification]);

    const handleRequestRide = async (pickup: string, destination: string, arrivalTime: string, partySize: number) => {
        if (!userId) return;
        setLoading(prev => ({ ...prev, request: true }));

        try {
            const date = new Date(arrivalTime);
            const timestamp = Timestamp.fromDate(date);

            const { response } = await riderClient.registerRideIntent({
                userId,
                stationAreaId: pickup,
                destinationAreaId: destination,
                arrivalTime: timestamp,
                partySize
            }, rpcOptions);

            setToast({ type: 'success', message: `Ride requested! Tracking ID: ${response.intentId.substring(0, 8)}` });
            await refreshHistory();
        } catch (err: any) {
            setToast({ type: 'error', message: err.message || 'Failed to request ride' });
        } finally {
            setLoading(prev => ({ ...prev, request: false }));
        }
    };

    return (
        <div className="space-y-6">
            {toast && (
                <div className={`fixed top-24 right-8 z-50 rounded-2xl border px-6 py-4 text-sm font-medium shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-8 duration-300 ${toast.type === 'success'
                    ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200'
                    : 'border-rose-500/40 bg-rose-950/80 text-rose-200'
                    }`}>
                    {toast.message}
                </div>
            )}

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Request Form Section */}
                <section className="lg:col-span-4">
                    <RideRequestForm
                        areas={areas}
                        onSubmit={handleRequestRide}
                        isLoading={loading.request || loading.areas}
                    />
                </section>

                {/* Ride History Section */}
                <section className="lg:col-span-8">
                    <RideHistoryList
                        rides={rides}
                        areas={areas}
                        isLoading={loading.history}
                    />
                </section>
            </div>
        </div>
    );
};

