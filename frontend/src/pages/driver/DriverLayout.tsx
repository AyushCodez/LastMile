import { Outlet } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DriverNotificationProvider } from '../../context/DriverNotificationContext';

const driverNavItems = [
    { label: 'Overview', path: '/driver' },
    { label: 'Create Route', path: '/driver/create-route' },
    { label: 'Active Routes', path: '/driver/active-routes' },
    { label: 'Profile', path: '/driver/profile' },
];

export const DriverLayout = () => {
    return (
        <DriverNotificationProvider>
            <DashboardLayout
                title="Driver Dashboard"
                navItems={driverNavItems}
            >
                <Outlet />
            </DashboardLayout>
        </DriverNotificationProvider>
    );
};
