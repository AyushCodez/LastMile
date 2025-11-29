import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userClient } from '../api/clients';
import * as UserPb from '../proto/user_pb';
const Credentials = UserPb.Credentials;

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'RIDER' | 'DRIVER'>('RIDER');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const req = new Credentials();
        req.setEmail(email);
        req.setPassword(password);

        userClient.authenticate(req, (err, response) => {
            if (err) {
                setError(err.message || 'Login failed');
                return;
            }
            if (response) {
                const token = response.getJwt();
                if (token && token !== 'INVALID') {
                    localStorage.setItem('token', token);
                    localStorage.setItem('role', role);
                    localStorage.setItem('email', email);
                    navigate(role === 'RIDER' ? '/rider' : '/driver');
                } else {
                    setError('Invalid credentials');
                }
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">LastMile Login</h1>
                {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    checked={role === 'RIDER'}
                                    onChange={() => setRole('RIDER')}
                                    className="mr-2"
                                />
                                Rider
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    checked={role === 'DRIVER'}
                                    onChange={() => setRole('DRIVER')}
                                    className="mr-2"
                                />
                                Driver
                            </label>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
