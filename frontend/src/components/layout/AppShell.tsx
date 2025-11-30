import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';

interface AppShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export const AppShell = ({ title, subtitle, actions, children }: AppShellProps) => {
  const { logout, role, userId, token } = useAuth();
  const authOptions = useMemo(() => (token ? { meta: { Authorization: `Bearer ${token}` } } : undefined), [token]);
  const { profileName } = useUserProfile(userId, authOptions);

  const roleLabel = useMemo(() => {
    if (!role) return '';
    return role === 'DRIVER' ? 'Driver' : 'Rider';
  }, [role]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black px-4 py-6 sm:px-8">
        <header className="flex flex-col gap-4 border border-white/5 rounded-3xl bg-white/5 backdrop-blur px-6 py-5 shadow-2xl shadow-indigo-500/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300/70">LastMile</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
            {subtitle && <p className="text-slate-300 text-sm mt-1">{subtitle}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
            {profileName && (
              <div className="rounded-full bg-white/10 px-4 py-2 font-medium">
                {profileName}
              </div>
            )}
            {roleLabel && (
              <span className="rounded-full border border-white/20 px-3 py-1 text-xs tracking-wide uppercase">
                {roleLabel}
              </span>
            )}
            {actions}
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-widest transition hover:bg-white/20"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="mt-8 space-y-6">{children}</main>
      </div>
    </div>
  );
};
