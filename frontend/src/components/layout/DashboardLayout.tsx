import type { ReactNode } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
    const { logout, role, userId } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:sticky top-0 h-screen w-72 border-r border-white/5 bg-[#0B0F19] z-50
                transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="flex flex-col h-full p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                                LM
                            </div>
                            <div>
                                <span className="font-bold text-xl tracking-tight block">LastMile</span>
                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Connect</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="md:hidden p-2 text-slate-400 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                                        ${isActive
                                            ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                                        }
                                    `}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                                    )}
                                    <span className="text-sm font-medium relative z-10">{item.label}</span>
                                    {isActive && (
                                        <div className="ml-auto w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-white/5">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">User {userId?.substring(0, 4)}</p>
                                    <p className="text-xs text-slate-500 truncate capitalize">{role?.toLowerCase()}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
                    {/* Mobile Header */}
                    <header className="md:hidden flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white">
                                LM
                            </div>
                            <span className="font-semibold text-lg">LastMile</span>
                        </div>
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </header>

                    {/* Page Header */}
                    <div className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                {title}
                            </h1>
                            {subtitle && <p className="mt-2 text-lg text-slate-400">{subtitle}</p>}
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
