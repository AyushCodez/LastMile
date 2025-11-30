import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userClient } from '../api/client';
import { CreateUserRequest_Role } from '../proto/user';

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
            <div className="w-full max-w-4xl rounded-[32px] border border-white/10 bg-white/5 p-10 backdrop-blur-xl shadow-2xl">
                <div className="mb-10 text-center">
                    <p className="text-sm uppercase tracking-[0.4em] text-indigo-300">Create account</p>
                    <h1 className="mt-3 text-4xl font-semibold">Join the LastMile network</h1>
                    <p className="mt-2 text-slate-300">Register as a rider or driver to experience seamless metro transfers.</p>
                </div>
                <form className="grid gap-6 md:grid-cols-2" onSubmit={handleRegister}>
                    <div className="md:col-span-1">
                        <label className="text-sm font-semibold text-slate-200">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-400"
                            placeholder="Ananya Rao"
                            required
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="text-sm font-semibold text-slate-200">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-400"
                            placeholder="you@metro.city"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-200">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-400"
                            placeholder="Create a strong password"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-200">I am a…</label>
                        <div className="mt-2 grid grid-cols-2 gap-3">
                            {(['RIDER', 'DRIVER'] as const).map((value) => (
                                <button
                                    type="button"
                                    key={value}
                                    onClick={() => setRole(value)}
                                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                                        role === value
                                            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100'
                                            : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30'
                                    }`}
                                >
                                    {value === 'RIDER' ? 'Rider' : 'Driver'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-3">
                        {error && <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
                        {success && <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-500 px-6 py-3 font-semibold uppercase tracking-widest text-white shadow-lg shadow-emerald-500/30 transition hover:scale-[1.01] disabled:opacity-50"
                        >
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                        <p className="text-center text-sm text-slate-300">
                            Already with us?{' '}
                            <Link to="/login" className="text-emerald-300 hover:text-emerald-200">Login</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};
