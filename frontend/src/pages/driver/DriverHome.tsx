import { Link } from 'react-router-dom';

export const DriverHomePage = () => {
    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Welcome Card */}
                <div className="col-span-full lg:col-span-2 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white shadow-2xl shadow-indigo-500/20">
                    <h2 className="text-3xl font-bold mb-4">Welcome back, Driver.</h2>
                    <p className="text-indigo-100 mb-8 max-w-md">
                        Ready to hit the road? Manage your fleet, plan your routes, and start picking up riders efficiently.
                    </p>
                    <div className="flex gap-4">
                        <Link
                            to="/driver/routes"
                            className="px-6 py-3 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition"
                        >
                            Manage Routes
                        </Link>
                        <Link
                            to="/driver/active"
                            className="px-6 py-3 rounded-xl bg-indigo-700/50 text-white font-semibold hover:bg-indigo-700/70 transition"
                        >
                            Go Live
                        </Link>
                    </div>
                </div>

                {/* Quick Stats Placeholder */}
                <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Total Trips</span>
                            <span className="text-xl font-mono text-white">0</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Rating</span>
                            <span className="text-xl font-mono text-white">5.0</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Today's Earnings</span>
                            <span className="text-xl font-mono text-white">$0.00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
