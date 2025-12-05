import { useState, useEffect, useMemo } from 'react';
import type { RpcOptions } from '@protobuf-ts/runtime-rpc';
import { driverClient, stationClient, locationClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Area } from '../../proto/common';
import type { DriverProfile, RoutePlan } from '../../proto/driver';
import { Timestamp } from '../../proto/google/protobuf/timestamp';

export const ActiveRoutes = () => {
    const { token } = useAuth();
    const [areas, setAreas] = useState<Area[]>([]);
    const [profile, setProfile] = useState<DriverProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [currentAreaId, setCurrentAreaId] = useState<string | null>(null);
    const [error, setError] = useState('');

    const rpcOptions = useMemo<RpcOptions | undefined>(() => (
        token ? { meta: { Authorization: `Bearer ${token}` } } : undefined
    ), [token]);

    const loadData = async () => {
        try {
            const driverId = localStorage.getItem('driverId');
            if (!driverId) return;

            const [areasRes, profileRes, snapshotRes] = await Promise.all([
                stationClient.listAreas({}, rpcOptions),
                driverClient.getDriver({ id: driverId }, rpcOptions),
                locationClient.getDriverSnapshot({ id: driverId }, rpcOptions).catch(() => ({ response: { currentAreaId: null } }))
            ]);
            setAreas(areasRes.response.items);
            setProfile(profileRes.response);
            if (snapshotRes.response.currentAreaId) {
                setCurrentAreaId(snapshotRes.response.currentAreaId);
            }
        } catch (err) {
            console.error('Failed to load data', err);
            setError('Failed to load active routes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [rpcOptions]);

    const handleUpdateStatus = async (routeId: string, pickingUp: boolean) => {
        const driverId = localStorage.getItem('driverId');
        if (!driverId) return;

        setUpdatingId(routeId);
        try {
            await driverClient.updatePickupStatus({ driverId, routeId, pickingUp }, rpcOptions);
            const { response } = await driverClient.getDriver({ id: driverId }, rpcOptions);
            setProfile(response);
        } catch (err: any) {
            setError(err.message || 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleMoveToStop = async (routeId: string, areaId: string) => {
        const driverId = localStorage.getItem('driverId');
        if (!driverId) return;

        setUpdatingId(`move-${areaId}`);
        try {
            await locationClient.updateDriverLocation({
                driverId,
                routeId,
                currentAreaId: areaId,
                occupancy: 0, // TODO: Track occupancy
                ts: Timestamp.now()
            }, rpcOptions);
            setCurrentAreaId(areaId);
        } catch (err: any) {
            setError(err.message || 'Failed to update location');
        } finally {
            setUpdatingId(null);
        }
    };

    const areaLookup = useMemo(() => new Map(areas.map(a => [a.id, a])), [areas]);

    const routes = useMemo<RoutePlan[]>(() => {
        if (!profile?.routes?.length) return [];
        return [...profile.routes].sort((a, b) => {
            const aSeconds = a.createdAt ? Number(a.createdAt.seconds) : 0;
            const bSeconds = b.createdAt ? Number(b.createdAt.seconds) : 0;
            return bSeconds - aSeconds;
        });
    }, [profile?.routes]);

    const timestampLabel = (ts?: Timestamp) => {
        if (!ts) return 'Awaiting schedule';
        try {
            return Timestamp.toDate(ts).toLocaleString();
        } catch {
            return 'Pending timestamp';
        }
    };

    if (loading) return <div className="text-slate-400 animate-pulse">Loading active routes...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <p className="text-sm uppercase tracking-widest text-indigo-400 font-semibold mb-1">Live Operations</p>
                <h1 className="text-3xl font-bold text-white">Active Routes</h1>
                <p className="text-slate-400 mt-2">Manage your current trips and passenger pickups.</p>
            </div>

            {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                {routes.length === 0 ? (
                    <Card className="border-dashed border-white/10 bg-transparent p-12 text-center">
                        <div className="h-16 w-16 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5 mb-4">
                            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No Active Routes</h3>
                        <p className="text-slate-400 mb-6">You don't have any active routes at the moment.</p>
                        <Button onClick={() => window.location.href = '/driver/create-route'}>
                            Create New Route
                        </Button>
                    </Card>
                ) : (
                    routes.map(route => {
                        // Determine current stop index based on currentAreaId
                        const currentStopIndex = route.stops.findIndex(s => s.areaId === currentAreaId);
                        const nextStop = currentStopIndex >= 0 && currentStopIndex < route.stops.length - 1
                            ? route.stops[currentStopIndex + 1]
                            : route.stops[0]; // Default to first stop if not started

                        return (
                            <Card key={route.routeId} className="overflow-hidden border-indigo-500/20">
                                <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">ID: {route.routeId.substring(0, 8)}</span>
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                Active
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400">Started {timestampLabel(route.createdAt)}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 border-transparent"
                                            onClick={() => handleUpdateStatus(route.routeId, true)}
                                            isLoading={updatingId === route.routeId}
                                            disabled={!!updatingId}
                                        >
                                            Start Pickup
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleUpdateStatus(route.routeId, false)}
                                            isLoading={updatingId === route.routeId}
                                            disabled={!!updatingId}
                                        >
                                            Stop Pickup
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-0 relative">
                                        {/* Vertical Line */}
                                        <div className="absolute left-[1.25rem] top-4 bottom-4 w-0.5 bg-indigo-500/20"></div>

                                        {route.stops.map((stop, idx) => {
                                            const isCurrent = stop.areaId === currentAreaId;
                                            const isPast = currentStopIndex > idx;
                                            const isNext = currentStopIndex + 1 === idx || (currentStopIndex === -1 && idx === 0);

                                            return (
                                                <div key={`${route.routeId}-${stop.sequence}`} className={`flex items-start gap-6 relative py-3 ${isPast ? 'opacity-50' : ''}`}>
                                                    <div className={`
                                                        h-10 w-10 flex-shrink-0 rounded-xl border flex items-center justify-center text-sm font-bold z-10 shadow-lg transition-all duration-300
                                                        ${isCurrent
                                                            ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-indigo-500/50'
                                                            : isPast
                                                                ? 'bg-slate-800 border-slate-700 text-slate-500'
                                                                : 'bg-slate-900 border-indigo-500/30 text-indigo-300'
                                                        }
                                                    `}>
                                                        {stop.sequence}
                                                    </div>
                                                    <div className="flex-1 min-w-0 pt-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className={`text-lg font-medium truncate ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                                                                {areaLookup.get(stop.areaId)?.name ?? stop.areaId}
                                                            </h4>
                                                            <span className="text-xs font-mono text-slate-500">+{stop.arrivalOffsetMinutes}m</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                {stop.isStation && (
                                                                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">Metro Station</span>
                                                                )}
                                                                {isCurrent && (
                                                                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider animate-pulse">Current Location</span>
                                                                )}
                                                            </div>

                                                            {/* Action Button for Next Stop */}
                                                            {isNext && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    className="h-8 text-xs"
                                                                    onClick={() => handleMoveToStop(route.routeId, stop.areaId)}
                                                                    isLoading={updatingId === `move-${stop.areaId}`}
                                                                    disabled={!!updatingId}
                                                                >
                                                                    Arrive Here
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
};
