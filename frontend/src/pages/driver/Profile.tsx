import { useState, useEffect, useMemo } from 'react';
import type { RpcOptions } from '@protobuf-ts/runtime-rpc';
import { driverClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { DriverProfile } from '../../proto/driver';

export const Profile = () => {
    const { token, userId } = useAuth();
    const [profile, setProfile] = useState<DriverProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [vehicleNo, setVehicleNo] = useState('');
    const [capacity, setCapacity] = useState(4);
    const [manualId, setManualId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const rpcOptions = useMemo<RpcOptions | undefined>(() => (
        token ? { meta: { Authorization: `Bearer ${token}` } } : undefined
    ), [token]);

    const loadProfile = async () => {
        const storedId = localStorage.getItem('driverId');
        if (storedId) {
            try {
                const { response } = await driverClient.getDriver({ id: storedId }, rpcOptions);
                setProfile(response);
            } catch (err) {
                console.error(err);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        loadProfile();
    }, [rpcOptions]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Registering driver...', { userId, vehicleNo, capacity });
        if (!userId) {
            console.error('User ID is missing');
            setError('User ID is missing. Please log in again.');
            return;
        }
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const { response } = await driverClient.registerDriver({
                userId,
                vehicleNo: vehicleNo.trim(),
                capacity
            }, rpcOptions);
            console.log('Registration successful', response);

            setProfile(response);
            localStorage.setItem('driverId', response.driverId);
            setSuccess('Vehicle registered successfully!');
        } catch (err: any) {
            console.error('Registration failed', err);
            setError(err.message || 'Failed to register');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAttach = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            const { response } = await driverClient.getDriver({ id: manualId.trim() }, rpcOptions);
            setProfile(response);
            localStorage.setItem('driverId', response.driverId);
            setSuccess('Profile attached successfully!');
            setManualId('');
        } catch (err) {
            setError('Driver ID not found');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-slate-400 animate-pulse">Loading profile...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <p className="text-sm uppercase tracking-widest text-indigo-400 font-semibold mb-1">Settings</p>
                <h1 className="text-3xl font-bold text-white">Fleet Identity</h1>
                <p className="text-slate-400 mt-2">Manage your vehicle details and driver profile.</p>
            </div>

            {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                </div>
            )}
            {success && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {success}
                </div>
            )}

            {profile ? (
                <Card className="border-indigo-500/20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white">Current Vehicle</h2>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                            Active
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Driver ID</p>
                            <div className="flex items-center gap-3">
                                <code className="text-lg text-white font-mono bg-black/30 px-3 py-1 rounded-lg">{profile.driverId}</code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(profile.driverId)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Copy ID"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Vehicle Number</p>
                                <p className="text-xl font-bold text-white">{profile.vehicleNo}</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Capacity</p>
                                <p className="text-xl font-bold text-white">{profile.capacity} Seats</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <p className="text-sm text-slate-400">
                                To update your vehicle details, please contact support or register a new profile.
                            </p>
                        </div>
                    </div>
                </Card>
            ) : (
                <Card>
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-white mb-2">Register Vehicle</h2>
                        <p className="text-slate-400 text-sm">Enter your vehicle details to start accepting rides.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        <Input
                            label="Vehicle Number"
                            placeholder="KA-01-AB-1234"
                            value={vehicleNo}
                            onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                            className="relative z-10"
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
                            isLoading={submitting}
                            isLoading={submitting}
                            onClick={handleRegister}
                        >
                            Register Vehicle
                        </Button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-900 px-4 text-slate-500 font-semibold tracking-wider">Or attach existing profile</span>
                        </div>
                    </div>

                    <form onSubmit={handleAttach} className="flex gap-3">
                        <div className="flex-1">
                            <Input
                                placeholder="Paste Driver ID..."
                                value={manualId}
                                onChange={(e) => setManualId(e.target.value)}
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="secondary"
                            disabled={!manualId || submitting}
                            isLoading={submitting}
                        >
                            Link Profile
                        </Button>
                    </form>
                </Card>
            )}
        </div>
    );
};
