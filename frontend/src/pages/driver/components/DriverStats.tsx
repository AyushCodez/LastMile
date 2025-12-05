import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { DriverProfile } from '../../../proto/driver';

interface DriverStatsProps {
    profile: DriverProfile | null;
    onRegister: (vehicleNo: string, capacity: number) => Promise<void>;
    onAttach: (driverId: string) => Promise<void>;
    isRegistering: boolean;
}

export const DriverStats = ({ profile, onRegister, onAttach, isRegistering }: DriverStatsProps) => {
    const [vehicleNo, setVehicleNo] = useState('');
    const [capacity, setCapacity] = useState(4);
    const [manualId, setManualId] = useState('');

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        onRegister(vehicleNo, capacity);
    };

    const handleAttach = (e: React.FormEvent) => {
        e.preventDefault();
        onAttach(manualId);
    };

    if (profile) {
        return (
            <Card className="h-full">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-indigo-300/70 font-semibold mb-1">Onboarding</p>
                        <h2 className="text-2xl font-bold text-white">Fleet Identity</h2>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                        Active
                    </span>
                </div>

                <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Driver ID</p>
                        <div className="flex items-center gap-3">
                            <code className="text-lg text-white font-mono">{profile.driverId}</code>
                            <button
                                onClick={() => navigator.clipboard.writeText(profile.driverId)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Vehicle</p>
                            <p className="text-lg font-semibold text-white">{profile.vehicleNo}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Capacity</p>
                            <p className="text-lg font-semibold text-white">{profile.capacity} Seats</p>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-indigo-300/70 font-semibold mb-1">Onboarding</p>
                <h2 className="text-2xl font-bold text-white">Fleet Identity</h2>
            </div>

            <div className="space-y-8">
                <form onSubmit={handleRegister} className="space-y-4">
                    <Input
                        label="Vehicle Number"
                        placeholder="KA-01-AB-1234"
                        value={vehicleNo}
                        onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                    />
                    <Input
                        label="Seating Capacity"
                        type="number"
                        min={2}
                        max={8}
                        value={capacity}
                        onChange={(e) => setCapacity(Number(e.target.value))}
                    />
                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={isRegistering}
                        disabled={!vehicleNo}
                    >
                        Register Vehicle
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-900 px-2 text-slate-500 font-semibold tracking-wider">Or attach existing</span>
                    </div>
                </div>

                <form onSubmit={handleAttach} className="space-y-4">
                    <Input
                        placeholder="Paste Driver ID..."
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value)}
                    />
                    <Button
                        type="submit"
                        variant="outline"
                        className="w-full"
                        disabled={!manualId}
                    >
                        Link Profile
                    </Button>
                </form>
            </div>
        </Card>
    );
};
