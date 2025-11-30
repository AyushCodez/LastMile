import { useState, useEffect, useMemo } from 'react';
import type { RpcOptions } from '@protobuf-ts/runtime-rpc';
import { riderClient, stationClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { RideStatus, RideStatus_Status } from '../../proto/rider';
import { Area } from '../../proto/common';

const getStatusColor = (status: RideStatus_Status) => {
    switch (status) {
        case RideStatus_Status.PENDING: return 'bg-amber-500/20 text-amber-200 border-amber-500/40';
        case RideStatus_Status.SCHEDULED: return 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40';
        case RideStatus_Status.PICKED_UP: return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40';
        case RideStatus_Status.COMPLETED: return 'bg-slate-700 text-slate-300 border-slate-600';
        case RideStatus_Status.CANCELLED: return 'bg-rose-500/20 text-rose-200 border-rose-500/40';
        default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
};

const getStatusLabel = (status: RideStatus_Status) => {
    switch (status) {
        case RideStatus_Status.PENDING: return 'Finding Driver';
        case RideStatus_Status.SCHEDULED: return 'Driver Assigned';
        case RideStatus_Status.PICKED_UP: return 'In Progress';
        case RideStatus_Status.COMPLETED: return 'Arrived';
        case RideStatus_Status.CANCELLED: return 'Cancelled';
        default: return 'Unknown';
    }
};

export const RideHistoryPage = () => {
    const { token, userId } = useAuth();
    const rpcOptions = useMemo<RpcOptions | undefined>(() => (
        token ? { meta: { Authorization: `Bearer ${token}` } } : undefined
    ), [token]);

    const [rides, setRides] = useState<RideStatus[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!userId) return;
            try {
                const [historyRes, areasRes] = await Promise.all([
                    riderClient.getRideHistory({ userId }, rpcOptions),
                    stationClient.listAreas({}, rpcOptions)
                ]);
                setRides(historyRes.response.rides);
                setAreas(areasRes.response.items);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [userId, rpcOptions]);

    const getAreaName = (id: string) => areas.find(a => a.id === id)?.name || id;

    if (loading) return <div className="text-slate-400">Loading history...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Your Journeys</h2>
                <div className="text-sm text-slate-400">
                    {rides.length} {rides.length === 1 ? 'ride' : 'rides'} total
                </div>
            </div>

            <div className="space-y-4">
                {rides.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-slate-400">
                        No rides yet. Start your first journey!
                    </div>
                ) : (
                    rides.map((ride, idx) => (
                        <div key={idx} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-5 transition hover:bg-white/10">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 text-lg font-medium text-white">
                                        <span>{getAreaName(ride.stationAreaId)}</span>
                                        <span className="text-slate-500">→</span>
                                        <span>{getAreaName(ride.destinationAreaId)}</span>
                                    </div>
                                    <p className="font-mono text-xs text-slate-500">
                                        ID: {ride.intentId}
                                    </p>
                                </div>

                                <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${getStatusColor(ride.status)}`}>
                                    <span className="h-2 w-2 rounded-full bg-current" />
                                    {getStatusLabel(ride.status)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
