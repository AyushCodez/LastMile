import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RpcOptions } from '@protobuf-ts/runtime-rpc';
import { driverClient, stationClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useDriverNotifications } from '../context/DriverNotificationContext';
import type { Area } from '../proto/common';
import type { DriverProfile, RoutePlan, RouteStop } from '../proto/driver';
import { DriverStats } from './driver/components/DriverStats';
import { RouteBuilder } from './driver/components/RouteBuilder';
import { ActiveRoutes } from './driver/components/ActiveRoutes';

type ToastState = {
    type: 'success' | 'error';
    message: string;
} | null;

const extractError = (error: unknown, fallback = 'Request failed') => {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    return fallback;
};

export const DriverDashboard = () => {
    const { token, userId } = useAuth();
    const { lastMatchEvent, clearMatchEvent } = useDriverNotifications();

    const rpcOptions = useMemo<RpcOptions | undefined>(() => (
        token ? { meta: { Authorization: `Bearer ${token}` } } : undefined
    ), [token]);

    const [areas, setAreas] = useState<Area[]>([]);
    const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
    const [driverId, setDriverId] = useState<string | null>(() => localStorage.getItem('driverId'));

    const [loading, setLoading] = useState({
        areas: true,
        profile: false,
        register: false,
        route: false,
        pickup: '' // routeId
    });

    const [toast, setToast] = useState<ToastState>(null);

    // Load Areas
    useEffect(() => {
        let ignore = false;
        const loadAreas = async () => {
            try {
                const { response } = await stationClient.listAreas({}, rpcOptions);
                if (!ignore) {
                    setAreas(response.items);
                    setLoading(prev => ({ ...prev, areas: false }));
                }
            } catch (error) {
                if (!ignore) {
                    setToast({ type: 'error', message: extractError(error, 'Unable to load service areas') });
                    setLoading(prev => ({ ...prev, areas: false }));
                }
            }
        };
        loadAreas();
        return () => { ignore = true; };
    }, [rpcOptions]);

    // Refresh Profile
    const refreshDriverProfile = useCallback(async (id: string) => {
        if (!id) return null;
        setLoading(prev => ({ ...prev, profile: true }));
        try {
            const { response } = await driverClient.getDriver({ id }, rpcOptions);
            setDriverProfile(response);
            setDriverId(response.driverId);
            localStorage.setItem('driverId', response.driverId);
            return response;
        } catch (error) {
            console.error('Failed to refresh profile', error);
        } finally {
            setLoading(prev => ({ ...prev, profile: false }));
        }
    }, [rpcOptions]);

    // Initial Profile Load
    useEffect(() => {
        if (driverId) {
            refreshDriverProfile(driverId);
        }
    }, [driverId, refreshDriverProfile]);

    // Real-time Updates
    useEffect(() => {
        if (lastMatchEvent && driverId) {
            console.log('Received match event, refreshing profile...', lastMatchEvent);
            refreshDriverProfile(driverId);
            setToast({ type: 'success', message: 'New ride match received!' });
            clearMatchEvent();
        }
    }, [lastMatchEvent, driverId, refreshDriverProfile, clearMatchEvent]);

    const handleRegisterDriver = async (vehicleNo: string, capacity: number) => {
        if (!userId) return;
        setLoading(prev => ({ ...prev, register: true }));
        try {
            const { response } = await driverClient.registerDriver({ userId, vehicleNo, capacity }, rpcOptions);
            setDriverProfile(response);
            setDriverId(response.driverId);
            localStorage.setItem('driverId', response.driverId);
            setToast({ type: 'success', message: 'Driver profile created!' });
        } catch (error) {
            setToast({ type: 'error', message: extractError(error, 'Failed to register driver') });
        } finally {
            setLoading(prev => ({ ...prev, register: false }));
        }
    };

    const handleAttachDriver = async (id: string) => {
        if (!id) return;
        try {
            const profile = await refreshDriverProfile(id);
            if (profile) {
                setToast({ type: 'success', message: 'Connected existing driver profile' });
            } else {
                setToast({ type: 'error', message: 'Driver ID not found' });
            }
        } catch (error) {
            setToast({ type: 'error', message: extractError(error, 'Failed to attach driver') });
        }
    };

    const handlePublishRoute = async (stops: RouteStop[]) => {
        if (!driverId) return;
        setLoading(prev => ({ ...prev, route: true }));
        try {
            const { response } = await driverClient.registerRoute({ driverId, stops }, rpcOptions);
            setToast({ type: 'success', message: `Route ${response.routeId.substring(0, 6)} published` });
            await refreshDriverProfile(driverId);
        } catch (error) {
            setToast({ type: 'error', message: extractError(error, 'Unable to save route') });
        } finally {
            setLoading(prev => ({ ...prev, route: false }));
        }
    };

    const handleUpdatePickupStatus = async (routeId: string, pickingUp: boolean) => {
        if (!driverId) return;
        setLoading(prev => ({ ...prev, pickup: routeId }));
        try {
            const { response } = await driverClient.updatePickupStatus({ driverId, routeId, pickingUp }, rpcOptions);
            const message = response.msg || (pickingUp ? 'Marked as picking riders up' : 'Marked as idle');
            setToast({ type: response.ok ? 'success' : 'error', message });
            // Optionally refresh to sync state if needed, though usually status is enough
        } catch (error) {
            setToast({ type: 'error', message: extractError(error, 'Failed to update pickup status') });
        } finally {
            setLoading(prev => ({ ...prev, pickup: '' }));
        }
    };

    const plannedRoutes = useMemo<RoutePlan[]>(() => {
        if (!driverProfile?.routes?.length) return [];
        return [...driverProfile.routes].sort((a, b) => {
            const aSeconds = a.createdAt ? Number(a.createdAt.seconds) : 0;
            const bSeconds = b.createdAt ? Number(b.createdAt.seconds) : 0;
            return bSeconds - aSeconds;
        });
    }, [driverProfile?.routes]);

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

            <div className="grid gap-6 xl:grid-cols-12">
                {/* Left Column: Stats & Route Builder */}
                <div className="xl:col-span-4 space-y-6">
                    <DriverStats
                        profile={driverProfile}
                        onRegister={handleRegisterDriver}
                        onAttach={handleAttachDriver}
                        isRegistering={loading.register}
                    />
                </div>

                {/* Right Column: Active Routes & Route Builder */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2 h-full">
                        <RouteBuilder
                            areas={areas}
                            onPublish={handlePublishRoute}
                            isPublishing={loading.route}
                            isDisabled={!driverId || loading.profile}
                        />
                        <ActiveRoutes
                            routes={plannedRoutes}
                            areas={areas}
                            onUpdateStatus={handleUpdatePickupStatus}
                            updatingRouteId={loading.pickup}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
