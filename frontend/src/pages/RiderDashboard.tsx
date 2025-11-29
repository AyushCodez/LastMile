import React, { useState, useEffect } from 'react';
import { riderClient, notificationClient } from '../api/clients';
import * as RiderPb from '../proto/rider_pb';
import * as NotificationPb from '../proto/notification_pb';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';

import { grpc } from "@improbable-eng/grpc-web";

const { RegisterRideIntentRequest } = RiderPb;
const { SubscribeRequest } = NotificationPb;

export default function RiderDashboard() {
    const [stationId, setStationId] = useState('');
    const [destId, setDestId] = useState('');
    const [notifications, setNotifications] = useState<string[]>([]);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('email'); // Using email as ID for simplicity in prototype
        if (!token || !userId) return;

        const req = new SubscribeRequest();
        req.setUserId(userId);

        const metadata = new grpc.Metadata();
        metadata.append("Authorization", `Bearer ${token}`);

        const stream = notificationClient.subscribe(req, metadata);
        stream.on('data', (note) => {
            setNotifications((prev) => [`${note.getTitle()}: ${note.getBody()}`, ...prev]);
        });

        return () => stream.cancel();
    }, []);

    const handleBook = (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('email');
        if (!token || !userId) return;

        const req = new RegisterRideIntentRequest();
        req.setUserId(userId);
        req.setStationAreaId(stationId);
        req.setDestinationAreaId(destId);

        // Set arrival time to now + 10 mins for demo
        const ts = new Timestamp();
        const now = Date.now() / 1000 + 600;
        ts.setSeconds(Math.floor(now));
        req.setArrivalTime(ts);

        const metadata = new grpc.Metadata();
        metadata.append("Authorization", `Bearer ${token}`);

        riderClient.registerRideIntent(req, metadata, (err, resp) => {
            if (err) {
                setMsg('Error: ' + err.message);
            } else {
                setMsg('Ride requested! Intent ID: ' + resp?.getIntentId());
            }
        });
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Rider Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">Book a Ride</h2>
                    {msg && <div className="mb-4 p-2 bg-blue-100 rounded">{msg}</div>}
                    <form onSubmit={handleBook}>
                        <div className="mb-4">
                            <label className="block mb-2">Station Area ID</label>
                            <input className="border p-2 w-full" value={stationId} onChange={e => setStationId(e.target.value)} placeholder="e.g. majestic" />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2">Destination Area ID</label>
                            <input className="border p-2 w-full" value={destId} onChange={e => setDestId(e.target.value)} placeholder="e.g. koramangala" />
                        </div>
                        <button className="bg-green-600 text-white p-2 rounded w-full">Request Ride</button>
                    </form>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">Notifications</h2>
                    <div className="h-64 overflow-y-auto border p-2">
                        {notifications.length === 0 ? <p className="text-gray-500">No notifications yet.</p> : (
                            notifications.map((n, i) => <div key={i} className="border-b p-2">{n}</div>)
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
