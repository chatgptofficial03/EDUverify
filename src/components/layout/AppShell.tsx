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
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800">
      {/* Top Demo Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-white tracking-wide">SIH 2026 PROTOTYPE:</span>
          <span>APAAR ID-Based Student Data Management & Verification Platform</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-slate-400">AICTE Ref: SIH26263</span>
          <span className="bg-blue-600/30 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded text-[10px] font-mono">
            LOCAL DEMONSTRATION MODE
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0">
          {/* Logo */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-900/50">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white tracking-tight leading-none text-base">EduVerify</div>
              <div className="text-[10px] text-blue-400 font-medium tracking-wide mt-1">APAAR ACADEMIC REGISTRY</div>
            </div>
          </div>

          {/* User Institution / Role context */}
          <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-950/40">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Active Scope</div>
            <div className="text-sm font-semibold text-white truncate mt-0.5">
              {user?.institutionName || 'AICTE Central Headquarters'}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="purple" size="sm">
                {role.replace('_', ' ')}
              </Badge>
              {user?.institutionCode && (
                <span className="text-[11px] text-slate-400 font-mono">{user.institutionCode}</span>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-blue-400 font-semibold flex items-center justify-center text-xs border border-slate-700 shrink-0">
                  {user?.name?.slice(0, 2).toUpperCase() || 'EV'}
                </div>
                <div className="truncate text-left">
                  <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-72 bg-slate-900 text-white flex flex-col z-10 shadow-2xl">
              <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-blue-400" />
                  <span className="font-bold text-lg">EduVerify</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-slate-400">
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
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                        isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 rounded-lg border border-rose-800"
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
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="text-sm font-medium text-slate-500">
                AICTE Academic Year <span className="font-semibold text-slate-900">2025-2026</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllNotifications}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-slate-400">
                          No notifications at this time.
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 text-xs transition-colors ${
                              n.isRead ? 'bg-white' : 'bg-blue-50/50'
                            }`}
                          >
                            <div className="font-medium text-slate-800">{n.title}</div>
                            <div className="text-slate-500 mt-0.5 leading-relaxed">{n.message}</div>
                            <div className="text-[10px] text-slate-400 mt-1">
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
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-slate-800">{user?.name}</div>
                <div className="text-[10px] text-slate-500">{user?.role}</div>
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
