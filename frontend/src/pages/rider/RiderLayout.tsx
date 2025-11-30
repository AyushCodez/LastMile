import { Outlet } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { RiderNotificationProvider, useRiderNotifications } from '../../context/RiderNotificationContext';
import { useEffect } from 'react';

const riderNavItems = [
    { label: 'Request Ride', path: '/rider/home' },
    { label: 'Ride History', path: '/rider/history' },
    { label: 'Profile', path: '/rider/profile' },
];

const RiderNotificationListener = () => {
    const { lastNotification, clearNotification } = useRiderNotifications();

    useEffect(() => {
        if (lastNotification) {
            alert(`Notification: ${lastNotification.body}`);
            clearNotification();
        }
    }, [lastNotification, clearNotification]);

    return null;
};

export const RiderLayout = () => {
    return (
        <RiderNotificationProvider>
            <DashboardLayout
                title="Rider Dashboard"
                navItems={riderNavItems}
            >
                <Outlet />
            </DashboardLayout>
            <RiderNotificationListener />
        </RiderNotificationProvider>
    );
};
