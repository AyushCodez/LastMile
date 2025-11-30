import { useState, useEffect, useMemo } from 'react';
import type { RpcOptions } from '@protobuf-ts/runtime-rpc';
import { driverClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { DriverProfile } from '../../proto/driver';

export const DriverProfilePage = () => {
    const { token, userId } = useAuth();
    const rpcOptions = useMemo<RpcOptions | undefined>(() => (
        token ? { meta: { Authorization: `Bearer ${token}` } } : undefined
    ), [token]);

    const [profile, setProfile] = useState<DriverProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [vehicleNo, setVehicleNo] = useState('');
    const [capacity, setCapacity] = useState(4);
    const [submitting, setSubmitting] = useState(false);
    const [manualId, setManualId] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            const storedId = localStorage.getItem('driverId');
            if (storedId) {
                try {
                    const { response } = await driverClient.getDriver({ id: storedId }, rpcOptions);
                    setProfile(response);
                    setVehicleNo(response.vehicleNo);
                    setCapacity(response.capacity);
                } catch (err) {
                    console.error(err);
                }
            }
            setLoading(false);
        };
        loadProfile();
    }, [rpcOptions]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const { response } = await driverClient.registerDriver({
                userId,
                vehicleNo: vehicleNo.trim(),
                capacity
            }, rpcOptions);

            setProfile(response);
            localStorage.setItem('driverId', response.driverId);
            setSuccess('Driver profile created successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to register');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAttach = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const { response } = await driverClient.getDriver({ id: manualId.trim() }, rpcOptions);
            setProfile(response);
            localStorage.setItem('driverId', response.driverId);
            setSuccess('Profile attached successfully!');
            setManualId('');
        } catch (err) {
            setError('Driver ID not found');
        }
    };

    if (loading) return <div className="text-slate-400">Loading profile...</div>;

    return (
        <div className="max-w-2xl">
            <div className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur">
                <div className="mb-8">
                    <p className="text-sm uppercase tracking-[0.3em] text-indigo-300/70">Identity</p>
                    <h2 className="text-2xl font-semibold text-white">Driver Profile</h2>
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

                {profile ? (
                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Driver ID</p>
                                <p className="mt-1 font-mono text-lg text-white">{profile.driverId}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Status</p>
                                <p className="mt-1 text-lg font-semibold text-emerald-400">Active</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Vehicle</p>
                                <p className="mt-1 text-lg text-white">{profile.vehicleNo}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Capacity</p>
                                <p className="mt-1 text-lg text-white">{profile.capacity} Riders</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <p className="text-sm text-slate-400">
                                To update your vehicle details, please contact support or register a new profile.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <form onSubmit={handleRegister} className="space-y-5">
                            <div>
                                <label className="text-xs uppercase tracking-[0.4em] text-slate-400">Vehicle Number</label>
                                <input
                                    type="text"
                                    value={vehicleNo}
                                    onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                                    placeholder="KA-01-AB-1234"
                                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-[0.4em] text-slate-400">Capacity</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="8"
                                    value={capacity}
                                    onChange={(e) => setCapacity(parseInt(e.target.value))}
                                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full rounded-2xl bg-indigo-500 px-6 py-4 font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-indigo-600 disabled:opacity-50"
                            >
                                {submitting ? 'Registering...' : 'Register Vehicle'}
                            </button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-slate-900 px-4 text-sm text-slate-400">Or attach existing</span>
                            </div>
                        </div>

                        <form onSubmit={handleAttach} className="flex gap-3">
                            <input
                                type="text"
                                value={manualId}
                                onChange={(e) => setManualId(e.target.value)}
                                placeholder="Enter Driver ID"
                                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="rounded-2xl border border-white/20 px-6 py-3 font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
                            >
                                Attach
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
