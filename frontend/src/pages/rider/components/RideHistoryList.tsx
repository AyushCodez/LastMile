import React from 'react';
import { Card } from '../../../components/ui/Card';
import type { RideStatus } from '../../../proto/rider';
import { RideStatus_Status } from '../../../proto/rider';
import type { Area } from '../../../proto/common';

interface RideHistoryListProps {
    rides: RideStatus[];
    areas: Area[];
    isLoading: boolean;
}

const getStatusColor = (status: RideStatus_Status) => {
    switch (status) {
        case RideStatus_Status.PENDING: return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
        case RideStatus_Status.SCHEDULED: return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
        case RideStatus_Status.PICKED_UP: return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
        case RideStatus_Status.COMPLETED: return 'bg-slate-800 text-slate-400 border-slate-700';
        case RideStatus_Status.CANCELLED: return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
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

export const RideHistoryList = ({ rides, areas, isLoading }: RideHistoryListProps) => {
    const getAreaName = (id: string) => areas.find(a => a.id === id)?.name || id;

    return (
        <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-xs uppercase tracking-widest text-indigo-300/70 font-semibold mb-1">History</p>
                    <h2 className="text-2xl font-bold text-white">Your Journeys</h2>
                </div>
                <div className="text-sm font-medium text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    {rides.length} {rides.length === 1 ? 'ride' : 'rides'}
                </div>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="text-center py-12 text-slate-500 animate-pulse">Loading ride history...</div>
                ) : rides.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-white/10 py-12 text-center">
                        <p className="text-slate-400">No rides yet. Start your first journey!</p>
                    </div>
                ) : (
                    rides.map((ride, idx) => (
                        <div key={idx} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/[0.07] hover:border-white/10">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-3 text-lg font-medium text-white">
                                        <span>{getAreaName(ride.stationAreaId)}</span>
                                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                        <span>{getAreaName(ride.destinationAreaId)}</span>
                                    </div>
                                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                                        ID: {ride.intentId}
                                    </p>
                                </div>

                                <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusColor(ride.status)}`}>
                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                    {getStatusLabel(ride.status)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};
