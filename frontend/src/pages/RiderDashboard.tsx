import { useState, useEffect, useMemo } from 'react';
import type { RpcOptions } from '@protobuf-ts/runtime-rpc';
import { useNavigate } from 'react-router-dom';
import { riderClient, stationClient } from '../api/client';
import { AppShell } from '../components/layout/AppShell';
import { useAuth } from '../context/AuthContext';
import { Area } from '../proto/common';
import { RideStatus, RideStatus_Status } from '../proto/rider';
import { Timestamp } from '../proto/google/protobuf/timestamp';

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

export const RiderDashboard = () => {
    const { token, userId } = useAuth();
    const navigate = useNavigate();

    const rpcOptions = useMemo<RpcOptions | undefined>(() => (
        token ? { meta: { Authorization: `Bearer ${token}` } } : undefined
    ), [token]);

    const [areas, setAreas] = useState<Area[]>([]);
    const [rides, setRides] = useState<RideStatus[]>([]);
    const [loadingAreas, setLoadingAreas] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [partySize, setPartySize] = useState(1);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load initial data
    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            try {
                // Fetch areas
                const { response: areaResponse } = await stationClient.listAreas({}, rpcOptions);
                if (mounted) {
                    setAreas(areaResponse.items);
                    if (areaResponse.items.length > 0) {
                        setPickup(areaResponse.items[0].id);
                        setDestination(areaResponse.items[1]?.id || areaResponse.items[0].id);
                    }
                    setLoadingAreas(false);
                }

                // Fetch history if user exists
                if (userId) {
                    const { response: historyResponse } = await riderClient.getRideHistory({ userId }, rpcOptions);
                    if (mounted) {
                        setRides(historyResponse.rides);
                        setLoadingHistory(false);
                    }
                }
            } catch (err) {
                console.error('Failed to load dashboard data', err);
                if (mounted) setError('Failed to load dashboard data. Please refresh.');
            }
        };

        loadData();
        return () => { mounted = false; };
    }, [userId, rpcOptions]);

    const handleRequestRide = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        setError('');
        setSuccess('');
        setSubmitting(true);

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

            setSuccess(`Ride requested! Tracking ID: ${response.intentId.substring(0, 8)}`);

            // Refresh history immediately
            const { response: historyResponse } = await riderClient.getRideHistory({ userId }, rpcOptions);
            setRides(historyResponse.rides);

            // Reset form slightly
            setArrivalTime('');
        } catch (err: any) {
            setError(err.message || 'Failed to request ride');
        } finally {
            setSubmitting(false);
        }
    };

    const getAreaName = (id: string) => areas.find(a => a.id === id)?.name || id;

    return (
        <AppShell
            title="Rider Dashboard"
            subtitle="Book your transit connection and track your journey."
        >
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Request Form Section */}
                <section className="lg:col-span-1">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-xl">
                        <div className="mb-6">
                            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300/70">New Trip</p>
                            <h2 className="text-2xl font-semibold text-white">Request a Ride</h2>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleRequestRide} className="space-y-5">
                            <div>
                                <label className="text-xs uppercase tracking-[0.4em] text-slate-400">Pickup Station</label>
                                <select
                                    value={pickup}
                                    onChange={(e) => setPickup(e.target.value)}
                                    disabled={loadingAreas}
                                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none disabled:opacity-50"
                                >
                                    {areas.map(area => (
                                        <option key={area.id} value={area.id} className="bg-slate-900">
                                            {area.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs uppercase tracking-[0.4em] text-slate-400">Destination</label>
                                <select
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    disabled={loadingAreas}
                                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none disabled:opacity-50"
                                >
                                    {areas.map(area => (
                                        <option key={area.id} value={area.id} className="bg-slate-900">
                                            {area.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs uppercase tracking-[0.4em] text-slate-400">Arrival Time</label>
                                <input
                                    type="datetime-local"
                                    value={arrivalTime}
                                    onChange={(e) => setArrivalTime(e.target.value)}
                                    required
                                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none [color-scheme:dark]"
                                />
                            </div>

                            <div>
                                <label className="text-xs uppercase tracking-[0.4em] text-slate-400">Party Size</label>
                                <div className="mt-2 flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="4"
                                        value={partySize}
                                        onChange={(e) => setPartySize(parseInt(e.target.value))}
                                        className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-white/10 accent-indigo-500"
                                    />
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 font-mono text-lg font-bold">
                                        {partySize}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || loadingAreas}
                                className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-4 font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-indigo-500/20 transition hover:shadow-indigo-500/40 disabled:opacity-50"
                            >
                                {submitting ? 'Requesting...' : 'Confirm Request'}
                            </button>
                        </form>
                    </div>
                </section>

                {/* Ride History Section */}
                <section className="lg:col-span-2">
                    <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] text-indigo-300/70">History</p>
                                <h2 className="text-2xl font-semibold text-white">Your Journeys</h2>
                            </div>
                            <div className="text-sm text-slate-400">
                                {rides.length} {rides.length === 1 ? 'ride' : 'rides'} total
                            </div>
                        </div>

                        <div className="space-y-4">
                            {loadingHistory ? (
                                <div className="text-center py-12 text-slate-500">Loading ride history...</div>
                            ) : rides.length === 0 ? (
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
                </section>
            </div>
        </AppShell>
    );
};

