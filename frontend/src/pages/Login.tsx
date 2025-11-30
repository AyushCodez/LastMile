
import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { userClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login, role, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated && role) {
            navigate(role === 'DRIVER' ? '/driver' : '/rider', { replace: true });
        }
    }, [isAuthenticated, navigate, role]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { response } = await userClient.authenticate({ email, password });
            login(response.jwt);
            const redirect = (location.state as { from?: Location })?.from?.pathname;
            if (redirect) {
                navigate(redirect, { replace: true });
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-5xl grid gap-10 rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl text-white lg:grid-cols-2">
                <div className="flex flex-col justify-center space-y-6">
                    <p className="text-sm tracking-[0.3em] uppercase text-indigo-300">LastMile Platform</p>
                    <h1 className="text-4xl font-semibold leading-tight">Seamless rides from every metro station</h1>
                    <p className="text-slate-300">
                        Login to request pickups, manage trips, and get real-time notifications about your journey.
                    </p>
                    <ul className="space-y-3 text-sm text-slate-200">
                        <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" />Secure JWT authentication</li>
                        <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-400" />Realtime ride status & notifications</li>
                        <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400" />Driver & Rider tailored dashboards</li>
                    </ul>
                </div>

                <div className="rounded-3xl bg-slate-900/70 p-8 shadow-inner shadow-black/40">
                    <h2 className="text-2xl font-semibold mb-6">Sign in</h2>
                    {error && <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
                    <form className="space-y-5" onSubmit={handleLogin}>
                        <div>
                            <label className="text-sm font-medium text-slate-300">Work Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-indigo-400"
                                placeholder="alex@lastmile.city"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-indigo-400"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 px-4 py-3 font-semibold uppercase tracking-widest text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/60 disabled:opacity-60"
                        >
                            {loading ? 'Signing in…' : 'Login'}
                        </button>
                    </form>
                    <p className="mt-6 text-center text-sm text-slate-400">
                        Don&apos;t have an account?{' '}
                        <Link className="font-semibold text-indigo-300 hover:text-indigo-200" to="/register">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
