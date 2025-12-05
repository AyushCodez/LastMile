import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type { RoutePlan } from '../../../proto/driver';
import type { Area } from '../../../proto/common';
import { Timestamp } from '../../../proto/google/protobuf/timestamp';

interface ActiveRoutesProps {
    routes: RoutePlan[];
    areas: Area[];
    onUpdateStatus: (routeId: string, pickingUp: boolean) => Promise<void>;
    updatingRouteId: string | null;
}

export const ActiveRoutes = ({ routes, areas, onUpdateStatus, updatingRouteId }: ActiveRoutesProps) => {
    const areaLookup = new Map(areas.map(a => [a.id, a]));

    const timestampLabel = (ts?: Timestamp) => {
        if (!ts) return 'Awaiting schedule';
        try {
            return Timestamp.toDate(ts).toLocaleString();
        } catch {
            return 'Pending timestamp';
        }
    };

    return (
        <Card className="h-full bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
            <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-indigo-300/70 font-semibold mb-1">Live Ops</p>
                <h2 className="text-2xl font-bold text-white">Active Routes</h2>
            </div>

            <div className="space-y-4">
                {routes.length === 0 ? (
                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center">
                        <p className="text-slate-400">No active routes. Publish a route to start driving.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {routes.map(route => (
                            <div key={route.routeId} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition-all hover:bg-white/[0.07]">
                                <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">ID: {route.routeId.substring(0, 8)}</span>
                                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/20">
                                                Active
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400">Created {timestampLabel(route.createdAt)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                                            onClick={() => onUpdateStatus(route.routeId, true)}
                                            isLoading={updatingRouteId === route.routeId}
                                            disabled={!!updatingRouteId}
                                        >
                                            Start Pickup
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => onUpdateStatus(route.routeId, false)}
                                            isLoading={updatingRouteId === route.routeId}
                                            disabled={!!updatingRouteId}
                                        >
                                            Stop
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    {route.stops.map((stop, idx) => (
                                        <div key={`${route.routeId}-${stop.sequence}`} className="flex items-center gap-4 relative">
                                            {idx !== route.stops.length - 1 && (
                                                <div className="absolute left-[1.25rem] top-8 bottom-[-1rem] w-0.5 bg-white/10"></div>
                                            )}
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 z-10">
                                                {stop.sequence}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {areaLookup.get(stop.areaId)?.name ?? stop.areaId}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {stop.isStation && (
                                                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase">Station</span>
                                                    )}
                                                    <span className="text-xs text-slate-500">+{stop.arrivalOffsetMinutes} min</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};
