import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userClient } from '../api/client';
import { CreateUserRequest_Role } from '../proto/user';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'RIDER' | 'DRIVER'>('RIDER');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await userClient.createUser({
                name,
                email,
                password,
                role: role === 'RIDER' ? CreateUserRequest_Role.RIDER : CreateUserRequest_Role.DRIVER,
            });
            setSuccess('Account created! You can now sign in.');
            setTimeout(() => navigate('/login'), 800);
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black flex items-center justify-center px-4 py-16 text-white">
            <Card variant="glass" className="w-full max-w-4xl p-10 shadow-2xl shadow-indigo-500/10">
                <div className="mb-10 text-center">
                    <p className="text-sm uppercase tracking-[0.4em] text-indigo-400 font-bold">Create account</p>
                    <h1 className="mt-3 text-4xl font-bold">Join the LastMile network</h1>
                    <p className="mt-3 text-slate-400">Register as a rider or driver to experience seamless metro transfers.</p>
                </div>

                <form className="grid gap-8 md:grid-cols-2" onSubmit={handleRegister}>
                    <div className="space-y-6">
                        <Input
                            label="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ananya Rao"
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@metro.city"
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a strong password"
                            required
                        />
                    </div>

                    <div className="space-y-6 flex flex-col justify-between">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">I am a…</label>
                            <div className="grid grid-cols-2 gap-4">
                                {(['RIDER', 'DRIVER'] as const).map((value) => (
                                    <button
                                        type="button"
                                        key={value}
                                        onClick={() => setRole(value)}
                                        className={`rounded-xl border-2 px-4 py-4 text-sm font-bold transition-all duration-200 ${role === value
                                                ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/20'
                                                : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10'
                                            }`}
                                    >
                                        {value === 'RIDER' ? 'Rider' : 'Driver'}
                                    </button>
                                ))}
                            </div>
                            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                                {role === 'RIDER'
                                    ? 'Riders can request trips from metro stations to their final destination.'
                                    : 'Drivers can register vehicles, plan routes, and accept ride requests.'}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {error && (
                                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    {success}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full py-4 text-base tracking-widest uppercase font-bold"
                                isLoading={loading}
                            >
                                Create Account
                            </Button>

                            <p className="text-center text-sm text-slate-400">
                                Already with us?{' '}
                                <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Login</Link>
                            </p>
                        </div>
                    </div>
                </form>
            </Card>
        </div>
    );
};
