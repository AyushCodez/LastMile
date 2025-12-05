import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { RpcOptions } from '@protobuf-ts/runtime-rpc';
import { driverClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { DriverProfile } from '../../proto/driver';

export const Overview = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<DriverProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const rpcOptions = useMemo<RpcOptions | undefined>(() => (
        token ? { meta: { Authorization: `Bearer ${token}` } } : undefined
    ), [token]);

    useEffect(() => {
        const loadProfile = async () => {
            const storedId = localStorage.getItem('driverId');
            if (storedId) {
                try {
                    const { response } = await driverClient.getDriver({ id: storedId }, rpcOptions);
                    setProfile(response);
                } catch (err) {
                    console.error('Failed to load profile', err);
                }
            }
            setLoading(false);
        };
        loadProfile();
    }, [rpcOptions]);

    if (loading) {
        return <div className="text-slate-400 animate-pulse">Loading dashboard...</div>;
    }

    if (!profile) {
        return (
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-white">Welcome to LastMile</h1>
                    <p className="text-slate-400 text-lg">Complete your fleet registration to start driving.</p>
                </div>

                <Card className="p-8 border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="h-16 w-16 rounded-full bg-indigo-500/10 flex items-center justify-center">
                            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">Setup your Profile</h2>
                            <p className="text-slate-400 max-w-sm">Register your vehicle or link an existing driver ID to access the route designer.</p>
                        </div>
                        <Button
                            size="lg"
                            onClick={() => navigate('/driver/profile')}
                            className="w-full sm:w-auto min-w-[200px]"
                        >
                            Complete Setup
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const activeRoutes = profile.routes || [];
    const hasActiveRoute = activeRoutes.length > 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-sm uppercase tracking-widest text-indigo-400 font-semibold mb-1">Driver Dashboard</p>
                    <h1 className="text-3xl font-bold text-white">
                        Welcome back, <span className="text-slate-400">{profile.vehicleNo}</span>
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate('/driver/profile')}>
                        View Profile
                    </Button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Current Route Status */}
                <Card className="col-span-full lg:col-span-2 p-0 overflow-hidden border-indigo-500/20">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
                            </svg>
                            Current Route Status
                        </h2>
                    </div>

                    <div className="p-8 text-center">
                        {hasActiveRoute ? (
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                    <span className="font-bold text-sm tracking-wide uppercase">Active Route in Progress</span>
                                </div>

                                <div>
                                    <p className="text-slate-400 mb-6">You have {activeRoutes.length} active route(s) scheduled.</p>
                                    <Button onClick={() => navigate('/driver/active-routes')} className="min-w-[200px]">
                                        Manage Active Routes
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 py-4">
                                <div className="h-16 w-16 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5">
                                    <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">No Active Route</h3>
                                    <p className="text-slate-400 max-w-md mx-auto">You are currently not serving any routes. Create a new route to start accepting passengers.</p>
                                </div>
                                <Button onClick={() => navigate('/driver/create-route')} className="min-w-[200px]">
                                    Create New Route
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Quick Stats */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">Capacity</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">{profile.capacity}</span>
                            <span className="text-slate-400">seats</span>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">Total Trips</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">0</span>
                            <span className="text-slate-400">completed</span>
                        </div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border-indigo-500/20">
                        <p className="text-xs uppercase tracking-widest text-indigo-300 font-semibold mb-2">Driver Rating</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">5.0</span>
                            <span className="text-indigo-300">★</span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
