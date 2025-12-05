
import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { userClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

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
            <div className="w-full max-w-5xl grid gap-10 lg:grid-cols-2 items-center">
                <div className="flex flex-col justify-center space-y-8 p-4">
                    <div>
                        <p className="text-sm tracking-[0.3em] uppercase text-indigo-400 font-bold mb-2">LastMile Platform</p>
                        <h1 className="text-5xl font-bold leading-tight text-white mb-4">
                            Seamless rides from every <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">metro station</span>
                        </h1>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            Login to request pickups, manage trips, and get real-time notifications about your journey.
                        </p>
                    </div>

                    <ul className="space-y-4 text-sm text-slate-300">
                        <li className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <span className="font-medium">Secure JWT authentication</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                            <span className="font-medium">Realtime ride status & notifications</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                            </div>
                            <span className="font-medium">Driver & Rider tailored dashboards</span>
                        </li>
                    </ul>
                </div>

                <Card variant="glass" className="p-8 md:p-10 shadow-2xl shadow-indigo-500/10 border-white/10">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
                        <p className="text-slate-400">Enter your credentials to access your account</p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 flex items-center gap-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <Input
                            label="Work Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="alex@lastmile.city"
                            required
                            autoFocus
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />

                        <Button
                            type="submit"
                            className="w-full py-3 text-base"
                            isLoading={loading}
                        >
                            Sign In
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-400">
                        Don&apos;t have an account?{' '}
                        <Link className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors" to="/register">
                            Create one now
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
};
