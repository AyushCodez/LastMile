import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { riderClient, stationClient, matchingClient } from '../api/client';
import { Area } from '../proto/common';
import { RideStatus, RideStatus_Status } from '../proto/rider';
import { Timestamp } from '../proto/google/protobuf/timestamp';

export const RiderDashboard = () => {
    const navigate = useNavigate();
    const [areas, setAreas] = useState<Area[]>([]);
    const [rides, setRides] = useState<RideStatus[]>([]);
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [partySize, setPartySize] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Fetch areas
        stationClient.listAreas({}).then(({ response }) => {
            setAreas(response.items);
            if (response.items.length > 0) {
                setPickup(response.items[0].id);
                setDestination(response.items[1]?.id || response.items[0].id);
            }
        }).catch(err => console.error('Failed to fetch areas', err));

        // Fetch ride history
        const userId = localStorage.getItem('userId');
        if (userId) {
            riderClient.getRideHistory({ userId }).then(({ response }) => {
                setRides(response.rides);
            }).catch(err => console.error('Failed to fetch history', err));
        }
    }, [navigate]);

    const handleRequestRide = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const userId = localStorage.getItem('userId');
        if (!userId) {
            setError('User ID not found');
            return;
        }

        try {
            // Parse datetime-local string to Timestamp
            const date = new Date(arrivalTime);
            const timestamp = Timestamp.fromDate(date);

            const { response } = await riderClient.registerRideIntent({
                userId,
                stationAreaId: pickup,
                destinationAreaId: destination,
                arrivalTime: timestamp,
                partySize
            });

            setSuccess(`Ride requested successfully! Intent ID: ${response.intentId}`);

            // Refresh history
            const history = await riderClient.getRideHistory({ userId });
            setRides(history.response.rides);
        } catch (err: any) {
            setError(err.message || 'Failed to request ride');
        }
    };

    const getAreaName = (id: string) => areas.find(a => a.id === id)?.name || id;

    const getStatusName = (status: RideStatus_Status) => {
        switch (status) {
            case RideStatus_Status.PENDING: return 'Pending';
            case RideStatus_Status.SCHEDULED: return 'Scheduled';
            case RideStatus_Status.PICKED_UP: return 'Picked Up';
            case RideStatus_Status.COMPLETED: return 'Completed';
            case RideStatus_Status.CANCELLED: return 'Cancelled';
            default: return 'Unknown';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Rider Dashboard</h1>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            navigate('/login');
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Request Ride Form */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Request a Ride</h2>
                        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

                        <form onSubmit={handleRequestRide} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pickup Station</label>
                                <select
                                    value={pickup}
                                    onChange={(e) => setPickup(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                >
                                    {areas.map(area => (
                                        <option key={area.id} value={area.id}>{area.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Destination</label>
                                <select
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                >
                                    {areas.map(area => (
                                        <option key={area.id} value={area.id}>{area.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Arrival Time</label>
                                <input
                                    type="datetime-local"
                                    value={arrivalTime}
                                    onChange={(e) => setArrivalTime(e.target.value)}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Party Size</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="4"
                                    value={partySize}
                                    onChange={(e) => setPartySize(parseInt(e.target.value))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Request Ride
                            </button>
                        </form>
                    </div>

                    {/* Ride History */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Your Rides</h2>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto">
                            {rides.length === 0 ? (
                                <p className="text-gray-500">No rides found.</p>
                            ) : (
                                rides.map((ride, idx) => (
                                    <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {getAreaName(ride.stationAreaId)} → {getAreaName(ride.destinationAreaId)}
                                                </p>
                                                <p className="text-sm text-gray-500">Intent ID: {ride.intentId.substring(0, 8)}...</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                                ${ride.status === RideStatus_Status.COMPLETED ? 'bg-green-100 text-green-800' :
                                                    ride.status === RideStatus_Status.PENDING ? 'bg-yellow-100 text-yellow-800' :
                                                        ride.status === RideStatus_Status.CANCELLED ? 'bg-red-100 text-red-800' :
                                                            'bg-blue-100 text-blue-800'}`}>
                                                {getStatusName(ride.status)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
