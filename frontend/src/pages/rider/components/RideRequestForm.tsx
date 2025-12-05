import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import type { Area } from '../../../proto/common';

interface RideRequestFormProps {
    areas: Area[];
    onSubmit: (pickup: string, destination: string, time: string, partySize: number) => Promise<void>;
    isLoading: boolean;
}

export const RideRequestForm = ({ areas, onSubmit, isLoading }: RideRequestFormProps) => {
    const [pickup, setPickup] = useState(areas[0]?.id || '');
    const [destination, setDestination] = useState(areas[1]?.id || areas[0]?.id || '');
    const [arrivalTime, setArrivalTime] = useState('');
    const [partySize, setPartySize] = useState(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(pickup, destination, arrivalTime, partySize);
    };

    return (
        <Card className="h-full bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10 border-indigo-500/20">
            <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-indigo-300/70 font-semibold mb-1">New Trip</p>
                <h2 className="text-2xl font-bold text-white">Request a Ride</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Select
                    label="Pickup Station"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    options={areas.map(a => ({ value: a.id, label: a.name }))}
                    disabled={isLoading}
                />

                <Select
                    label="Destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    options={areas.map(a => ({ value: a.id, label: a.name }))}
                    disabled={isLoading}
                />

                <Input
                    label="Arrival Time"
                    type="datetime-local"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    required
                    disabled={isLoading}
                    className="[color-scheme:dark]"
                />

                <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                        Party Size
                    </label>
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-2">
                        <input
                            type="range"
                            min="1"
                            max="4"
                            value={partySize}
                            onChange={(e) => setPartySize(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 ml-2"
                            disabled={isLoading}
                        />
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/20">
                            {partySize}
                        </div>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full py-4 text-base tracking-widest uppercase font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25"
                    isLoading={isLoading}
                >
                    Confirm Request
                </Button>
            </form>
        </Card>
    );
};
