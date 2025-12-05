import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RpcOptions } from '@protobuf-ts/runtime-rpc';
import { driverClient, stationClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import type { Area } from '../../proto/common';
import type { RouteStop } from '../../proto/driver';

export const RouteDesigner = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [areas, setAreas] = useState<Area[]>([]);
    const [stops, setStops] = useState<RouteStop[]>([]);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState('');

    const rpcOptions = useMemo<RpcOptions | undefined>(() => (
        token ? { meta: { Authorization: `Bearer ${token}` } } : undefined
    ), [token]);

    // Load Areas
    useEffect(() => {
        const loadAreas = async () => {
            try {
                const { response } = await stationClient.listAreas({});
                setAreas(response.items);
            } catch (err) {
                console.error('Failed to load areas', err);
                setError('Failed to load service areas. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        loadAreas();
    }, [rpcOptions]);

    const areaLookup = useMemo(() => new Map(areas.map(a => [a.id, a])), [areas]);

    const getAvailableAreas = (lastStopAreaId?: string) => {
        if (!lastStopAreaId) return areas;
        const lastArea = areaLookup.get(lastStopAreaId);
        if (!lastArea || !lastArea.neighbours) return areas;
        const neighbourIds = new Set(lastArea.neighbours.map(n => n.toAreaId));
        return areas.filter(a => neighbourIds.has(a.id));
    };

    const handleAddStop = () => {
        const lastStop = stops[stops.length - 1];
        const availableAreas = getAvailableAreas(lastStop?.areaId);

        if (availableAreas.length === 0) return;

        const newStop: RouteStop = {
            sequence: stops.length + 1,
            areaId: availableAreas[0].id,
            isStation: availableAreas[0].isStation,
            arrivalOffsetMinutes: lastStop ? lastStop.arrivalOffsetMinutes + 10 : 0,
        };
        setStops([...stops, newStop]);
    };

    const handleUpdateStop = (index: number, field: keyof RouteStop, value: any) => {
        const newStops = [...stops];
        const stop = { ...newStops[index], [field]: value };

        if (field === 'areaId') {
            const area = areaLookup.get(value);
            stop.isStation = area?.isStation ?? false;
        }

        newStops[index] = stop;
        setStops(newStops);
    };

    const handleRemoveStop = (index: number) => {
        setStops(stops.filter((_, i) => i !== index).map((s, i) => ({ ...s, sequence: i + 1 })));
    };

    const handlePublish = async () => {
        const driverId = localStorage.getItem('driverId');
        if (!driverId) {
            setError('Driver profile not found. Please complete setup.');
            return;
        }

        setPublishing(true);
        setError('');

        try {
            await driverClient.registerRoute({ driverId, stops }, rpcOptions);
            navigate('/driver/active-routes');
        } catch (err: any) {
            setError(err.message || 'Failed to publish route');
            setPublishing(false);
        }
    };

    if (loading) return <div className="text-slate-400 animate-pulse">Loading designer...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <p className="text-sm uppercase tracking-widest text-indigo-400 font-semibold mb-1">Route Management</p>
                <h1 className="text-3xl font-bold text-white">Route Designer</h1>
                <p className="text-slate-400 mt-2">Create a new route by selecting connected stops.</p>
            </div>

            {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                </div>
            )}

            <Card className="border-indigo-500/20">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white">Compose Loop</h2>
                    <div className="flex gap-3">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setStops([])}
                            disabled={stops.length === 0 || publishing}
                        >
                            Reset
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleAddStop}
                            disabled={publishing}
                        >
                            Add Stop
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    {stops.length === 0 ? (
                        <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center bg-white/5">
                            <div className="h-12 w-12 mx-auto rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <p className="text-slate-400 font-medium">Start by adding your first pickup point.</p>
                            <p className="text-slate-500 text-sm mt-1">The system will automatically filter for connected areas.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stops.map((stop, index) => {
                                const available = index === 0
                                    ? areas
                                    : getAvailableAreas(stops[index - 1].areaId);

                                return (
                                    <div key={index} className="flex flex-col md:flex-row gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 animate-in slide-in-from-left-4 duration-300">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-300 border border-indigo-500/20">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <Select
                                                    label={index === 0 ? "Starting Point" : "Next Stop"}
                                                    value={stop.areaId}
                                                    onChange={(e) => handleUpdateStop(index, 'areaId', e.target.value)}
                                                    options={available.map(a => ({
                                                        value: a.id,
                                                        label: `${a.name} ${a.isStation ? '(Station)' : ''}`
                                                    }))}
                                                    disabled={publishing}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-end gap-4 w-full md:w-auto">
                                            <div className="w-32">
                                                <Input
                                                    label="Offset"
                                                    type="number"
                                                    min={0}
                                                    value={stop.arrivalOffsetMinutes}
                                                    onChange={(e) => handleUpdateStop(index, 'arrivalOffsetMinutes', Number(e.target.value))}
                                                    disabled={publishing}
                                                    leftIcon={<span className="text-xs font-bold">min</span>}
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleRemoveStop(index)}
                                                disabled={publishing}
                                                className="mb-[2px] h-[50px] w-[50px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-slate-500 font-medium">
                            {stops.length < 2 ? 'Minimum 2 stops required to publish' : `${stops.length} stops configured`}
                        </p>
                        <Button
                            size="lg"
                            onClick={handlePublish}
                            disabled={stops.length < 2 || publishing}
                            isLoading={publishing}
                            className="w-full sm:w-auto min-w-[200px]"
                        >
                            Publish Route
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
