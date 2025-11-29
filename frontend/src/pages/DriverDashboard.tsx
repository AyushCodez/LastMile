import React, { useState, useEffect } from 'react';
import { driverClient, notificationClient } from '../api/clients';
import * as DriverPb from '../proto/driver_pb';
import * as NotificationPb from '../proto/notification_pb';
import * as LocationPb from '../proto/location_pb';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';

import { grpc } from "@improbable-eng/grpc-web";

const { RegisterRouteRequest, RouteStop } = DriverPb;
const { SubscribeRequest } = NotificationPb;
const { DriverTelemetry } = LocationPb;

export default function DriverDashboard() {
    const [routeId, setRouteId] = useState('');
    const [notifications, setNotifications] = useState<string[]>([]);
    const [msg, setMsg] = useState('');
    const [simulating, setSimulating] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('email');
        if (!token || !userId) return;

        const req = new SubscribeRequest();
        req.setUserId(userId); // Assuming userId maps to driverId for notifications in this demo setup

        const metadata = new grpc.Metadata();
        metadata.append("Authorization", `Bearer ${token}`);

        const stream = notificationClient.subscribe(req, metadata);
        stream.on('data', (note) => {
            setNotifications((prev) => [`${note.getTitle()}: ${note.getBody()}`, ...prev]);
        });

        return () => stream.cancel();
    }, []);

    const handleRegisterRoute = (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('email');
        if (!token || !userId) return;

        const req = new RegisterRouteRequest();
        req.setDriverId(userId); // Using email as ID

        // Hardcoded stops for demo
        const s1 = new RouteStop(); s1.setSequence(1); s1.setAreaId('majestic'); s1.setArrivalOffsetMinutes(0); s1.setIsStation(true);
        const s2 = new RouteStop(); s2.setSequence(2); s2.setAreaId('mg_road'); s2.setArrivalOffsetMinutes(10); s2.setIsStation(false);
        const s3 = new RouteStop(); s3.setSequence(3); s3.setAreaId('indiranagar'); s3.setArrivalOffsetMinutes(20); s3.setIsStation(false);

        req.setStopsList([s1, s2, s3]);

        const metadata = new grpc.Metadata();
        metadata.append("Authorization", `Bearer ${token}`);

        driverClient.registerRoute(req, metadata, (err, resp) => {
            if (err) {
                setMsg('Error: ' + err.message);
            } else {
                setRouteId(resp?.getRouteId() || '');
                setMsg('Route registered! ID: ' + resp?.getRouteId());
            }
        });
    };

    const toggleSimulation = () => {
        if (simulating) {
            setSimulating(false);
            return;
        }
        setSimulating(true);
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('email');
        if (!token || !userId) return;

        // Simulate moving through stops
        const areas = ['majestic', 'mg_road', 'indiranagar'];
        let idx = 0;

        const interval = setInterval(() => {
            if (idx >= areas.length) {
                clearInterval(interval);
                setSimulating(false);
                return;
            }

            const tel = new DriverTelemetry();
            tel.setDriverId(userId);
            tel.setRouteId(routeId);
            tel.setCurrentAreaId(areas[idx]);
            tel.setOccupancy(0);

            const ts = new Timestamp();
            ts.setSeconds(Math.floor(Date.now() / 1000));
            tel.setTs(ts);

            // Streaming call - but here we just send one-off for simplicity as grpc-web streaming upload is tricky
            // Actually, standard grpc-web client doesn't support client-side streaming (only server streaming).
            // So we can't use StreamDriverTelemetry if it's defined as client-streaming in proto.
            // Let's check location.proto.
            // rpc StreamDriverTelemetry(stream DriverTelemetry) returns (Ack);
            // Ah, client streaming is NOT supported in grpc-web.
            // We need a unary endpoint or use a different approach (e.g. repeated calls to a unary endpoint).
            // Since I can't change backend easily now without breaking other things, I might be stuck.
            // But wait, Envoy can translate? No, browser can't send stream.
            // I should have checked this.
            // Workaround: I can't implement telemetry simulation from browser if it requires client streaming.
            // I will skip telemetry simulation from frontend for now, or just log that it's not supported.
            // Or I can add a Unary endpoint to LocationService if I really want to support it.

            console.log('Would send telemetry for', areas[idx]);
            setMsg(`Simulating: At ${areas[idx]}`);
            idx++;
        }, 3000);
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Driver Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">Actions</h2>
                    {msg && <div className="mb-4 p-2 bg-blue-100 rounded">{msg}</div>}

                    <button onClick={handleRegisterRoute} className="bg-blue-600 text-white p-2 rounded w-full mb-4">
                        Register Demo Route (Majestic to Indiranagar)
                    </button>

                    <button onClick={toggleSimulation} className={`p-2 rounded w-full ${simulating ? 'bg-red-500' : 'bg-green-600'} text-white`}>
                        {simulating ? 'Stop Simulation' : 'Start Simulation (Log Only)'}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Note: Client streaming not supported in gRPC-Web. Simulation logs to console.</p>
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
