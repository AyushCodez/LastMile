import { useState, useEffect, useMemo } from 'react';
import type { RpcOptions } from '@protobuf-ts/runtime-rpc';
import { useNavigate } from 'react-router-dom';
import { riderClient, stationClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Area } from '../../proto/common';
import { Timestamp } from '../../proto/google/protobuf/timestamp';

export const RequestRidePage = () => {
    const { token, userId } = useAuth();
    const navigate = useNavigate();
    const rpcOptions = useMemo<RpcOptions | undefined>(() => (
        token ? { meta: { Authorization: `Bearer ${token}` } } : undefined
    ), [token]);

    const [areas, setAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(true);
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [partySize, setPartySize] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        stationClient.listAreas({}, rpcOptions).then(({ response }) => {
            setAreas(response.items);
            if (response.items.length > 0) {
                setPickup(response.items[0].id);
                setDestination(response.items[1]?.id || response.items[0].id);
            }
            setLoading(false);
        }).catch(console.error);
    }, [rpcOptions]);

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        setSubmitting(true);
        setError('');

        try {
            const date = new Date(arrivalTime);
            const timestamp = Timestamp.fromDate(date);

            await riderClient.registerRideIntent({
                userId,
                stationAreaId: pickup,
                destinationAreaId: destination,
                arrivalTime: timestamp,
                partySize
            }, rpcOptions);

            navigate('/rider/history');
        } catch (err: any) {
            setError(err.message || 'Failed to request ride');
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur shadow-xl">
                <div className="mb-8">
                    <p className="text-sm uppercase tracking-[0.3em] text-indigo-300/70">New Trip</p>
                    <h2 className="text-2xl font-semibold text-white">Request a Ride</h2>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRequest} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs uppercase tracking-[0.4em] text-slate-400 block mb-2">Pickup</label>
                            <select
                                value={pickup}
                                onChange={(e) => setPickup(e.target.value)}
                                disabled={loading}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none"
                            >
                                {areas.map(area => (
                                    <option key={area.id} value={area.id} className="bg-slate-900">
                                        {area.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase tracking-[0.4em] text-slate-400 block mb-2">Destination</label>
                            <select
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                disabled={loading}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none"
                            >
                                {areas.map(area => (
                                    <option key={area.id} value={area.id} className="bg-slate-900">
                                        {area.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs uppercase tracking-[0.4em] text-slate-400 block mb-2">Arrival Time</label>
                        <input
                            type="datetime-local"
                            value={arrivalTime}
                            onChange={(e) => setArrivalTime(e.target.value)}
                            required
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none [color-scheme:dark]"
                        />
                    </div>

                    <div>
                        <label className="text-xs uppercase tracking-[0.4em] text-slate-400 block mb-2">Party Size: {partySize}</label>
                        <input
                            type="range"
                            min="1"
                            max="4"
                            value={partySize}
                            onChange={(e) => setPartySize(parseInt(e.target.value))}
                            className="w-full h-2 rounded-lg bg-white/10 accent-indigo-500 cursor-pointer"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || loading}
                        className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-4 font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-indigo-500/20 transition hover:shadow-indigo-500/40 disabled:opacity-50"
                    >
                        {submitting ? 'Requesting...' : 'Confirm Request'}
                    </button>
                </form>
            </div>
        </div>
    );
};
