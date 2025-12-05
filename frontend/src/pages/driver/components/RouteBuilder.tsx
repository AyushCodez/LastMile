import React, { useState, useMemo } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import type { Area } from '../../../proto/common';
import type { RouteStop } from '../../../proto/driver';

interface RouteBuilderProps {
    areas: Area[];
    onPublish: (stops: RouteStop[]) => Promise<void>;
    isPublishing: boolean;
    isDisabled: boolean;
}

export const RouteBuilder = ({ areas, onPublish, isPublishing, isDisabled }: RouteBuilderProps) => {
    const [stops, setStops] = useState<RouteStop[]>([]);

    const areaLookup = useMemo(() => new Map(areas.map(a => [a.id, a])), [areas]);

    // Get available areas for the next stop based on the last stop's neighbours
    const getAvailableAreas = (lastStopAreaId?: string) => {
        if (!lastStopAreaId) return areas;

        const lastArea = areaLookup.get(lastStopAreaId);
        if (!lastArea || !lastArea.neighbours) return areas; // Fallback if no neighbours defined

        const neighbourIds = new Set(lastArea.neighbours.map(n => n.toAreaId));
        // Also include the current area to allow staying/loops if needed, or just strict neighbours
        // Let's assume strict neighbours for connectivity + the area itself if needed? 
        // Usually you move FROM A TO B.
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

            // If we change a stop, we might invalidate subsequent stops if they are not connected
            // For simplicity, we'll just update this one. 
            // A more complex implementation would validate the whole chain.
        }

        newStops[index] = stop;
        setStops(newStops);
    };

    const handleRemoveStop = (index: number) => {
        setStops(stops.filter((_, i) => i !== index).map((s, i) => ({ ...s, sequence: i + 1 })));
    };

    const availableAreasForStop = (index: number) => {
        if (index === 0) return areas;
        const prevStop = stops[index - 1];
        return getAvailableAreas(prevStop.areaId);
    };

    return (
        <Card className="h-full bg-gradient-to-br from-indigo-500/10 via-transparent to-sky-500/10 border-indigo-500/20">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-xs uppercase tracking-widest text-indigo-300/70 font-semibold mb-1">Route Designer</p>
                    <h2 className="text-2xl font-bold text-white">Compose Loop</h2>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setStops([])}
                        disabled={stops.length === 0 || isDisabled}
                    >
                        Reset
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleAddStop}
                        disabled={isDisabled}
                    >
                        Add Stop
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {stops.length === 0 ? (
                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center">
                        <p className="text-slate-400">Start by adding your first pickup point.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {stops.map((stop, index) => {
                            const available = availableAreasForStop(index);
                            return (
                                <div key={index} className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 animate-in slide-in-from-left-4 duration-300">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-300 border border-indigo-500/20">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <Select
                                                value={stop.areaId}
                                                onChange={(e) => handleUpdateStop(index, 'areaId', e.target.value)}
                                                options={available.map(a => ({
                                                    value: a.id,
                                                    label: `${a.name} ${a.isStation ? '(Station)' : ''}`
                                                }))}
                                                disabled={isDisabled}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="w-32">
                                            <Input
                                                type="number"
                                                min={0}
                                                value={stop.arrivalOffsetMinutes}
                                                onChange={(e) => handleUpdateStop(index, 'arrivalOffsetMinutes', Number(e.target.value))}
                                                placeholder="Offset"
                                                disabled={isDisabled}
                                                leftIcon={<span className="text-xs font-bold">min</span>}
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveStop(index)}
                                            disabled={isDisabled}
                                            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
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

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                        {stops.length < 2 ? 'Minimum 2 stops required' : `${stops.length} stops configured`}
                    </p>
                    <Button
                        onClick={() => onPublish(stops)}
                        disabled={stops.length < 2 || isPublishing || isDisabled}
                        isLoading={isPublishing}
                        className="px-8"
                    >
                        Publish Route
                    </Button>
                </div>
            </div>
        </Card>
    );
};
