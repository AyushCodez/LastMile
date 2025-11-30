import { Link } from 'react-router-dom';

export const RiderHomePage = () => {
    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Welcome Card */}
                <div className="col-span-full lg:col-span-2 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white shadow-2xl shadow-indigo-500/20">
                    <h2 className="text-3xl font-bold mb-4">Where to next?</h2>
                    <p className="text-indigo-100 mb-8 max-w-md">
                        Connect with local transit hubs seamlessly. Book a ride, track your driver, and get moving.
                    </p>
                    <div className="flex gap-4">
                        <Link
                            to="/rider/request"
                            className="px-6 py-3 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition"
                        >
                            Request Ride
                        </Link>
                        <Link
                            to="/rider/history"
                            className="px-6 py-3 rounded-xl bg-indigo-700/50 text-white font-semibold hover:bg-indigo-700/70 transition"
                        >
                            View History
                        </Link>
                    </div>
                </div>

                {/* Status Card Placeholder */}
                <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur">
                    <h3 className="text-lg font-semibold text-white mb-4">Active Trip</h3>
                    <div className="flex flex-col items-center justify-center h-40 text-slate-400 border border-dashed border-white/10 rounded-2xl">
                        <p>No active trip</p>
                        <Link to="/rider/request" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2">
                            Book now &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
