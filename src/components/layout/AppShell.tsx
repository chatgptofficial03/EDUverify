'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UploadCloud,
  FileCheck2,
  Building2,
  ShieldCheck,
  BarChart3,
  History,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Award,
} from 'lucide-react';
import { SessionUser } from '@/lib/types';
import { Badge } from '../ui/Badge';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch session user on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else if (pathname !== '/login' && pathname !== '/') {
          router.push('/login');
        }
      } catch (e) {
        console.error('Session fetch error:', e);
      } finally {
        setLoadingUser(false);
      }
    }
    loadSession();
  }, [pathname, router]);

  // Fetch notifications periodically
  useEffect(() => {
    if (!user) return;
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (err) {
        // silent
      }
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (e) {
      router.push('/login');
    }
  };

  const handleMarkAllNotifications = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {}
  };

  if (pathname === '/login' || pathname === '/') {
    return <>{children}</>;
  }

  // Define nav links by role
  const role = user?.role || 'INSTITUTION_ADMIN';

  const navLinks = [
    // Institution admin links
    ...(role === 'INSTITUTION_ADMIN'
      ? [
          { name: 'Institution Dashboard', href: '/dashboard/institution', icon: LayoutDashboard },
          { name: 'Student Directory', href: '/students', icon: Users },
          { name: 'CSV Bulk Upload', href: '/imports/new', icon: UploadCloud },
          { name: 'Import History', href: '/imports', icon: History },
          { name: 'Audit Trail', href: '/audit', icon: History },
        ]
      : []),

    // Central AICTE admin links
    ...(role === 'AICTE_ADMIN'
      ? [
          { name: 'Central Dashboard', href: '/dashboard/central', icon: LayoutDashboard },
          { name: 'Review Queue', href: '/submissions', icon: FileCheck2 },
          { name: 'Institution Management', href: '/institutions', icon: Building2 },
          { name: 'Student Directory', href: '/students', icon: Users },
          { name: 'Verification Portal', href: '/verification', icon: ShieldCheck },
          { name: 'Analytics & Reports', href: '/analytics', icon: BarChart3 },
          { name: 'System Audit Logs', href: '/audit', icon: History },
        ]
      : []),

    // Verifier links
    ...(role === 'VERIFIER'
      ? [
          { name: 'Student Verification', href: '/verification', icon: ShieldCheck },
          { name: 'Verification Requests', href: '/verification/requests', icon: FileCheck2 },
          { name: 'Verification Audits', href: '/audit', icon: History },
        ]
      : []),

    // Observer links
    ...(role === 'OBSERVER'
      ? [
          { name: 'Analytics & Trends', href: '/analytics', icon: BarChart3 },
          { name: 'Institutions', href: '/institutions', icon: Building2 },
        ]
      : []),

    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f8f6f0] flex flex-col antialiased text-oxford-950 font-sans selection:bg-gold-500/20 selection:text-oxford-900">
      {/* Top Formal Sovereign Header Banner */}
      <div className="bg-oxford-950 text-slate-300 text-xs py-2 px-5 flex items-center justify-between border-b border-gold-500/30 relative z-40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gold-500/20 border border-gold-400/40 text-gold-300 font-mono text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold tracking-wider">SIH 2026 AICTE PROTOTYPE</span>
          </div>
          <span className="hidden md:inline font-serif text-slate-200 tracking-wide text-[11px]">
            All India Council for Technical Education &bull; APAAR National Academic Identity Registry
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-gold-400/90 font-mono hidden sm:inline">Ref: SIH26263</span>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-oxford-900 border border-gold-500/30 text-gold-200 text-[10px] font-mono shadow-xs">
            <Award className="w-3 h-3 text-gold-400" />
            <span>OFFICIAL DEMO</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar: Classic Executive Sovereign Style */}
        <aside className="hidden lg:flex lg:flex-col w-68 bg-oxford-950 border-r border-gold-500/20 shrink-0 relative overflow-hidden">
          {/* Subtle Guilloche Watermark Pattern */}
          <div className="absolute inset-0 dark-guilloche-pattern opacity-40 pointer-events-none" />

          {/* Logo & Emblems */}
          <div className="h-20 px-6 flex items-center gap-3.5 border-b border-gold-500/20 relative z-10 bg-oxford-950/80 backdrop-blur-xs">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-200 p-[1.5px] shadow-3d-gold shrink-0">
              <div className="w-full h-full bg-oxford-950 rounded-[10px] flex items-center justify-center text-gold-300">
                <GraduationCap className="w-6 h-6 drop-shadow-[0_2px_4px_rgba(197,155,72,0.4)]" />
              </div>
            </div>
            <div>
              <div className="font-display font-extrabold text-white tracking-wider text-lg leading-tight flex items-center gap-1.5">
                <span>EduVerify</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-300 font-mono font-normal">
                  3D
                </span>
              </div>
              <div className="text-[9px] text-gold-400/90 font-serif tracking-widest uppercase mt-0.5">
                APAAR ACADEMIC REGISTRY
              </div>
            </div>
          </div>

          {/* User Institution / Role context */}
          <div className="px-5 py-4 border-b border-gold-500/15 bg-gradient-to-b from-oxford-900/60 to-oxford-950/80 relative z-10">
            <div className="text-[10px] font-serif uppercase tracking-widest text-gold-400/90 font-semibold flex items-center gap-1.5">
              <span className="w-1 h-2.5 bg-gold-500 rounded-full inline-block" />
              Active Institutional Scope
            </div>
            <div className="text-xs font-bold text-white truncate mt-1 font-serif tracking-wide">
              {user?.institutionName || 'AICTE Central Directorate'}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="gold" size="sm">
                {role.replace('_', ' ')}
              </Badge>
              {user?.institutionCode && (
                <span className="text-[10px] text-gold-300/80 font-mono px-1.5 py-0.5 rounded bg-black/30 border border-gold-500/30">
                  {user.institutionCode}
                </span>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto relative z-10">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 relative ${
                    isActive
                      ? 'bg-gradient-to-r from-gold-500/20 to-oxford-850 text-gold-200 border border-gold-400/40 shadow-sm shadow-gold-950/40 font-semibold'
                      : 'text-slate-300 hover:text-gold-200 hover:bg-oxford-900/80 hover:border-gold-500/20 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-gold-400 to-amber-500 rounded-r" />
                  )}
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-gold-400' : 'text-slate-400 group-hover:text-gold-300'
                    }`}
                  />
                  <span className="font-sans tracking-wide">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-gold-500/20 bg-oxford-950 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gold-600 to-amber-300 p-[1.5px] shrink-0 shadow-sm">
                  <div className="w-full h-full rounded-full bg-oxford-950 text-gold-300 font-serif font-bold flex items-center justify-center text-xs">
                    {user?.name?.slice(0, 2).toUpperCase() || 'EV'}
                  </div>
                </div>
                <div className="truncate text-left">
                  <div className="text-xs font-serif font-bold text-white truncate">{user?.name}</div>
                  <div className="text-[10px] text-slate-400 truncate font-mono">{user?.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out of Portal"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors border border-transparent hover:border-rose-900/50"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Modal */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-oxford-950/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-76 bg-oxford-950 text-white flex flex-col z-10 shadow-2xl border-r border-gold-500/30">
              <div className="h-18 px-6 flex items-center justify-between border-b border-gold-500/20">
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-6 h-6 text-gold-400" />
                  <span className="font-display font-bold text-lg text-white">EduVerify</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium ${
                        isActive
                          ? 'bg-gold-500/20 text-gold-200 border border-gold-400/40 font-semibold'
                          : 'text-slate-300 hover:bg-oxford-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-gold-400" />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-gold-500/20">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 rounded-xl border border-rose-800"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Header: Classic Executive Styling */}
          <header className="h-16 bg-white/90 backdrop-blur-md border-b border-gold-300/30 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-3d-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-oxford-900 hover:bg-gold-50 rounded-lg border border-gold-300/40"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-xs font-serif text-slate-600">
                <span className="w-2 h-2 rounded-full bg-gold-500" />
                <span>AICTE Academic Registry Cycle:</span>
                <span className="font-bold text-oxford-950 font-mono bg-parchment-100 px-2 py-0.5 rounded border border-gold-300/50">
                  2025&ndash;2026
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Link to Verification Portal */}
              <Link
                href="/verification"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif font-semibold text-oxford-900 bg-gold-50 hover:bg-gold-100/80 border border-gold-400/50 rounded-xl shadow-xs transition-all hover:-translate-y-0.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                <span>Fast Verify Record</span>
              </Link>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-oxford-800 hover:text-oxford-950 hover:bg-gold-50 rounded-xl relative transition-colors border border-transparent hover:border-gold-300/40"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-600 rounded-full ring-2 ring-white"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-3d-lg border border-gold-300/40 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 border-b border-gold-200/40 flex items-center justify-between bg-parchment-50 rounded-t-xl">
                      <span className="font-serif font-bold text-oxford-950 text-xs tracking-wide">
                        Official AICTE Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllNotifications}
                          className="text-[11px] font-sans text-gold-700 hover:text-gold-900 font-semibold hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-slate-400 font-serif">
                          No pending official notices at this time.
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 text-xs transition-colors ${
                              n.isRead ? 'bg-white' : 'bg-gold-50/40'
                            }`}
                          >
                            <div className="font-serif font-bold text-oxford-900">{n.title}</div>
                            <div className="text-slate-600 mt-0.5 leading-relaxed font-sans">{n.message}</div>
                            <div className="text-[10px] text-slate-400 mt-1 font-mono">
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Institution badge */}
              <div className="hidden sm:block text-right border-l border-gold-300/30 pl-3">
                <div className="text-xs font-serif font-bold text-oxford-950">{user?.name}</div>
                <div className="text-[10px] text-gold-700 font-mono font-medium">{user?.role}</div>
              </div>
            </div>
          </header>

          {/* Page Content Body */}
          <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
