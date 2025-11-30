import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';

interface NavItem {
    label: string;
    path: string;
    icon?: string;
}

interface DashboardLayoutProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    navItems: NavItem[];
    actions?: ReactNode;
}

export const DashboardLayout = ({ title, subtitle, children, navItems, actions }: DashboardLayoutProps) => {
    const { logout, role, userId, token } = useAuth();
    const location = useLocation();

    // We can reuse the profile hook if needed, or just display basic info
    // const { profileName } = useUserProfile(userId, token ? { meta: { Authorization: `Bearer ${token}` } } : undefined);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 hidden md:flex flex-col border-r border-white/5 bg-slate-900/50 backdrop-blur-xl fixed h-full z-10">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white">
                            LM
                        </div>
                        <span className="font-semibold text-lg tracking-tight">LastMile</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className="text-sm font-medium">{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">User {userId?.substring(0, 6)}</p>
                            <p className="text-xs text-slate-500 truncate capitalize">{role?.toLowerCase()}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
                    {/* Mobile Header */}
                    <header className="md:hidden flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                        <span className="font-semibold text-lg">LastMile</span>
                        <button onClick={logout} className="text-sm text-slate-400">Logout</button>
                    </header>

                    {/* Page Header */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
                            {subtitle && <p className="mt-2 text-slate-400">{subtitle}</p>}
                        </div>
                        {actions && <div className="flex items-center gap-3">{actions}</div>}
                    </div>

                    {/* Content */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
