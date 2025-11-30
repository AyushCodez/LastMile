import { useState, useEffect, useMemo, useRef } from 'react';
import type { RpcOptions } from '@protobuf-ts/runtime-rpc';
import { driverClient, locationClient, tripClient, stationClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { RoutePlan, RouteStop } from '../../proto/driver';
import { useDriverNotifications } from '../../context/DriverNotificationContext';
import { Timestamp } from '../../proto/google/protobuf/timestamp';

export const ActiveRoutePage = () => {
    const { token, userId } = useAuth();
    const { lastMatchEvent, clearMatchEvent } = useDriverNotifications();

    const rpcOptions = useMemo<RpcOptions | undefined>(() => (
        token ? { meta: { Authorization: `Bearer ${token}` } } : undefined
    ), [token]);

    const [routes, setRoutes] = useState<RoutePlan[]>([]);
    const [activeRoute, setActiveRoute] = useState<RoutePlan | null>(null);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [isAtStation, setIsAtStation] = useState(false);
    const [areaNames, setAreaNames] = useState<Record<string, string>>({});
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [processingMatch, setProcessingMatch] = useState(false);

    // Load Routes and Area Names
    useEffect(() => {
        const loadData = async () => {
            const driverId = localStorage.getItem('driverId');
            if (!driverId) return;

            try {
                const [driverRes, areasRes] = await Promise.all([
                    driverClient.getDriver({ id: driverId }, rpcOptions),
                    stationClient.listAreas({}, rpcOptions)
                ]);

                setRoutes(driverRes.response.routes);
                const nameMap: Record<string, string> = {};
                areasRes.response.items.forEach(a => nameMap[a.id] = a.name);
                setAreaNames(nameMap);
            } catch (err) {
                console.error('Failed to load initial data:', err);
            }
        };
        loadData();
    }, [rpcOptions]);

    // Handle Match Events
    useEffect(() => {
        if (lastMatchEvent && activeRoute) {
            // Verify the match is for the current station/route context if needed
            // For now, assume backend sends relevant matches
            setShowMatchModal(true);
        }
    }, [lastMatchEvent, activeRoute]);

    const handleArrive = async () => {
        if (!activeRoute) return;
        const stop = activeRoute.stops[currentStopIndex];
        const driverId = localStorage.getItem('driverId');
        if (!driverId) return;

        try {
            // Send telemetry update
            // Use unary call instead of client streaming
            await locationClient.updateDriverLocation({
                driverId,
                routeId: activeRoute.routeId,
                currentAreaId: stop.areaId,
                occupancy: 0, // TODO: Track occupancy
                ts: Timestamp.now()
            }, rpcOptions);

            setIsAtStation(true);

            // Also enable pickup status
            await driverClient.updatePickupStatus({
                driverId,
                routeId: activeRoute.routeId,
                pickingUp: true
            }, rpcOptions);

        } catch (err) {
            console.error('Failed to update location:', err);
            alert('Failed to update location. Please try again.');
        }
    };

    const handleDepart = async () => {
        if (!activeRoute) return;
        const driverId = localStorage.getItem('driverId');
        if (!driverId) return;

        try {
            // Disable pickup status while moving
            await driverClient.updatePickupStatus({
                driverId,
                routeId: activeRoute.routeId,
                pickingUp: false
            }, rpcOptions);

            setIsAtStation(false);
            if (currentStopIndex < activeRoute.stops.length - 1) {
                setCurrentStopIndex(prev => prev + 1);
            } else {
                // Route complete
                alert('Route Completed!');
                setActiveRoute(null);
                setCurrentStopIndex(0);
            }
        } catch (err) {
            console.error('Failed to depart:', err);
        }
    };

    const handleAcceptRide = async () => {
        if (!lastMatchEvent || !activeRoute) return;
        setProcessingMatch(true);
        const driverId = localStorage.getItem('driverId');
        if (!driverId) return;

        try {
            console.log('Accepting ride with match event:', lastMatchEvent);
            if (!lastMatchEvent.result) {
                console.error('Match event result is missing');
                return;
            }

            const request = {
                driverId: driverId,
                routeId: activeRoute.routeId,
                stationAreaId: lastMatchEvent.stationAreaId,
                destinationAreaId: lastMatchEvent.result.destinationAreaId,
                riderIds: lastMatchEvent.result.riderIds,
                scheduledDeparture: Timestamp.now()
            };
            console.log('CreateTrip Request:', request);

            await tripClient.createTrip(request, rpcOptions);

            setShowMatchModal(false);
            clearMatchEvent();
            alert('Ride Accepted! Passenger notified.');
        } catch (err) {
            console.error('Failed to accept ride:', err);
            alert('Failed to accept ride. It may have expired.');
        } finally {
            setProcessingMatch(false);
        }
    };

    if (!activeRoute) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white">Select a Route to Start</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {routes.map(route => (
                        <button
                            key={route.routeId}
                            onClick={() => setActiveRoute(route)}
                            className="p-6 text-left rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-indigo-400 font-mono text-sm">{route.routeId}</span>
                                <span className="text-slate-400 text-xs">{route.stops.length} Stops</span>
                            </div>
                            <div className="text-white font-medium">
                                {areaNames[route.stops[0]?.areaId] || route.stops[0]?.areaId}
                                <span className="text-slate-500 mx-2">→</span>
                                {areaNames[route.finalAreaId] || route.finalAreaId}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const currentStop = activeRoute.stops[currentStopIndex];
    const nextStop = activeRoute.stops[currentStopIndex + 1];

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Active Route</h2>
                    <p className="text-slate-400 text-sm font-mono">{activeRoute.routeId}</p>
                </div>
                <button
                    onClick={() => setActiveRoute(null)}
                    className="text-sm text-red-400 hover:text-red-300"
                >
                    End Route
                </button>
            </div>

            {/* Current Status Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-2xl">
                <div className="relative z-10">
                    <p className="text-indigo-200 text-sm font-medium tracking-wider uppercase mb-2">
                        {isAtStation ? 'Currently At' : 'Next Stop'}
                    </p>
                    <h1 className="text-4xl font-bold mb-8">
                        {areaNames[currentStop.areaId] || currentStop.areaId}
                    </h1>

                    {!isAtStation ? (
                        <button
                            onClick={handleArrive}
                            className="w-full py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-50 transition-colors"
                        >
                            Arrived at Station
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                                <p className="text-sm text-indigo-100 mb-1">Status</p>
                                <p className="font-semibold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    Boarding / Waiting for Riders
                                </p>
                            </div>
                            <button
                                onClick={handleDepart}
                                className="w-full py-4 bg-indigo-900/50 text-white border border-indigo-400/30 rounded-xl font-bold text-lg hover:bg-indigo-900/70 transition-colors"
                            >
                                Depart for {nextStop ? (areaNames[nextStop.areaId] || 'Next Stop') : 'End of Route'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Background Pattern */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
            </div>

            {/* Timeline */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Route Timeline</h3>
                <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                    {activeRoute.stops.map((stop, idx) => {
                        const isPast = idx < currentStopIndex;
                        const isCurrent = idx === currentStopIndex;

                        return (
                            <div key={idx} className={`relative ${isPast ? 'opacity-50' : ''}`}>
                                <div className={`absolute -left-[2.15rem] w-4 h-4 rounded-full border-2 ${isCurrent ? 'bg-indigo-500 border-indigo-500 ring-4 ring-indigo-500/20' :
                                    isPast ? 'bg-slate-700 border-slate-700' : 'bg-slate-900 border-slate-600'
                                    }`} />
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-slate-200">
                                            {areaNames[stop.areaId] || stop.areaId}
                                        </span>
                                        <span className="text-xs text-slate-500 font-mono">
                                            +{stop.arrivalOffsetMinutes} min
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Match Modal */}
            {showMatchModal && lastMatchEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 rounded-3xl border border-indigo-500/50 p-6 max-w-sm w-full shadow-2xl shadow-indigo-500/20">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">👋</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">New Ride Request!</h3>
                            <p className="text-slate-400">
                                A rider wants to join your trip at <br />
                                <span className="text-indigo-400 font-semibold">
                                    {areaNames[lastMatchEvent.stationAreaId] || lastMatchEvent.stationAreaId}
                                </span>
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleAcceptRide}
                                disabled={processingMatch}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                            >
                                {processingMatch ? 'Accepting...' : 'Accept Ride'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowMatchModal(false);
                                    clearMatchEvent();
                                }}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-semibold transition-colors"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
