import { useState, useEffect, useMemo } from 'react';
import type { RpcOptions } from '@protobuf-ts/runtime-rpc';
import { driverClient, stationClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Area } from '../../proto/common';
import { RouteStop } from '../../proto/driver';

export const RouteManagerPage = () => {
    const { token } = useAuth();
    const rpcOptions = useMemo<RpcOptions | undefined>(() => (
        token ? { meta: { Authorization: `Bearer ${token}` } } : undefined
    ), [token]);

    const [areas, setAreas] = useState<Area[]>([]);
    const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        console.log('[RouteManager] Fetching areas...');
        stationClient.listAreas({}, rpcOptions).then(({ response }) => {
            console.log('[RouteManager] Areas fetched:', response.items.length);
            setAreas(response.items);
        }).catch(err => console.error('[RouteManager] Failed to fetch areas:', err));
    }, [rpcOptions]);

    const handleAddStop = () => {
        console.log('[RouteManager] Adding stop. Current stops:', routeStops.length);
        if (areas.length === 0) {
            console.warn('[RouteManager] No areas available to add stop');
            return;
        }
        const lastStop = routeStops[routeStops.length - 1];

        // Logic change: Try to find a DIFFERENT area than the last one if possible, 
        // or just default to the first one.
        let nextAreaId = areas[0].id;
        if (lastStop) {
            // Simple logic: pick the next area in the list if available, to avoid duplicates by default
            const currentIndex = areas.findIndex(a => a.id === lastStop.areaId);
            if (currentIndex !== -1 && currentIndex < areas.length - 1) {
                nextAreaId = areas[currentIndex + 1].id;
            }
        }

        const newStop: RouteStop = {
            sequence: routeStops.length + 1,
            areaId: nextAreaId,
            arrivalOffsetMinutes: lastStop ? lastStop.arrivalOffsetMinutes + 10 : 0,
            isStation: true // Default, will update based on area selection
        };
        console.log('[RouteManager] New stop added:', newStop);
        setRouteStops([...routeStops, newStop]);
    };

    const updateStop = (index: number, updates: Partial<RouteStop>) => {
        console.log(`[RouteManager] Updating stop ${index}:`, updates);
        const newStops = [...routeStops];
        newStops[index] = { ...newStops[index], ...updates };

        // Update isStation based on area
        if (updates.areaId) {
            const area = areas.find(a => a.id === updates.areaId);
            if (area) newStops[index].isStation = area.isStation;
        }

        setRouteStops(newStops);
    };

    const removeStop = (index: number) => {
        console.log(`[RouteManager] Removing stop ${index}`);
        setRouteStops(routeStops.filter((_, i) => i !== index).map((s, i) => ({ ...s, sequence: i + 1 })));
    };

    const handlePublish = async () => {
        console.log('[RouteManager] Attempting to publish route...');
        const driverId = localStorage.getItem('driverId');
        console.log('[RouteManager] Driver ID:', driverId);

        if (!driverId) {
            const msg = 'No driver profile found. Please go to Profile.';
            console.error('[RouteManager]', msg);
            setError(msg);
            return;
        }
        if (routeStops.length < 2) {
            const msg = 'Route must have at least 2 stops.';
            console.warn('[RouteManager]', msg);
            setError(msg);
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            console.log('[RouteManager] Sending registerRoute request:', { driverId, stops: routeStops });
            const { response } = await driverClient.registerRoute({
                driverId,
                stops: routeStops
            }, rpcOptions);
            console.log('[RouteManager] Route published successfully:', response);
            setSuccess(`Route published! ID: ${response.routeId.substring(0, 8)}`);
            setRouteStops([]);
        } catch (err: any) {
            console.error('[RouteManager] Failed to publish route:', err);
            setError(err.message || 'Failed to publish route');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
                <div className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300/70">Planner</p>
                            <h2 className="text-2xl font-semibold text-white">Route Designer</h2>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setRouteStops([])}
                                className="px-4 py-2 rounded-xl border border-white/10 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleAddStop}
                                className="px-4 py-2 rounded-xl bg-white/10 text-sm font-medium text-white hover:bg-white/20 transition"
                            >
                                + Add Stop
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                            {success}
                        </div>
                    )}

                    <div className="space-y-4">
                        {routeStops.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl text-slate-500">
                                Add stops to build your route.
                            </div>
                        ) : (
                            routeStops.map((stop, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 items-start md:items-center">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-sm shrink-0">
                                        {idx + 1}
                                    </div>

                                    <div className="flex-1 w-full">
                                        <label className="text-xs uppercase tracking-wider text-slate-500 mb-1 block">Area</label>
                                        <select
                                            value={stop.areaId}
                                            onChange={(e) => updateStop(idx, { areaId: e.target.value })}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                                        >
                                            {areas.map(a => (
                                                <option key={a.id} value={a.id}>{a.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="w-full md:w-32">
                                        <label className="text-xs uppercase tracking-wider text-slate-500 mb-1 block">Offset (min)</label>
                                        <input
                                            type="number"
                                            value={stop.arrivalOffsetMinutes}
                                            onChange={(e) => updateStop(idx, { arrivalOffsetMinutes: parseInt(e.target.value) })}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>

                                    <button
                                        onClick={() => removeStop(idx)}
                                        className="p-2 text-slate-500 hover:text-red-400 transition"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                        <button
                            onClick={handlePublish}
                            disabled={saving || routeStops.length < 2}
                            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Publishing...' : 'Publish Route'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur">
                    <h3 className="text-lg font-semibold text-white mb-4">Available Areas</h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {areas.map(area => (
                            <div key={area.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                <span className="text-sm text-slate-300">{area.name}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${area.isStation ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700 text-slate-400'}`}>
                                    {area.isStation ? 'Station' : 'Zone'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
