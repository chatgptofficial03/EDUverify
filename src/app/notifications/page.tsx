'use client';
import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  FileCheck2,
  UploadCloud,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {}
  };

  const handleMarkAll = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {}
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Persisted notifications for batch submissions, review outcomes, and platform alerts
          </p>
        </div>
        <button
          onClick={handleMarkAll}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
        >
          <Check className="w-3.5 h-3.5" />
          Mark all as read
        </button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">No notifications logged.</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                  n.isRead ? 'bg-white' : 'bg-blue-50/40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{n.title}</span>
                    <Badge variant={n.isRead ? 'neutral' : 'info'}>{n.category}</Badge>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 text-xs font-medium hover:bg-slate-100 rounded shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
