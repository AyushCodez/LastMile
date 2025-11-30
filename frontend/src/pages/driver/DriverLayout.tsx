import { Outlet } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DriverNotificationProvider } from '../../context/DriverNotificationContext';

const driverNavItems = [
    { label: 'Home', path: '/driver/home' },
    { label: 'My Routes', path: '/driver/routes' },
    { label: 'Active Route', path: '/driver/active' },
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
