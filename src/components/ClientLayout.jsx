'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Sidebar from './Sidebar';
import Header from './Header';
import CommandPalette from './CommandPalette';
import { Toaster } from 'sonner';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, theme, setTheme, setLeads, setShops, setTasks } = useStore();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 1. Fetch Session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          // Fetch initial data once logged in
          fetchCRMData();
        } else {
          setUser(null);
          if (pathname !== '/login') {
            router.push('/login');
          }
        }
      } catch (e) {
        console.error('Session fetch failed', e);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, [pathname, setUser, router]);

  // 2. Initialize Theme
  useEffect(() => {
    setTheme('light'); // Force light theme always
  }, [setTheme]);

  // 3. PWA Service worker registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => console.log('PWA Service Worker registered:', registration.scope),
          (err) => console.warn('PWA Service Worker registration failed:', err)
        );
      });
    }
  }, []);

  // 3. Helper to fetch CRM data for global search and dashboards
  const fetchCRMData = async () => {
    try {
      const [leadsRes, shopsRes, tasksRes] = await Promise.all([
        fetch('/api/leads').then(res => res.json()),
        fetch('/api/shops').then(res => res.json()),
        fetch('/api/tasks').then(res => res.json())
      ]);

      if (Array.isArray(leadsRes.leads)) setLeads(leadsRes.leads);
      if (Array.isArray(shopsRes.shops)) setShops(shopsRes.shops);
      if (Array.isArray(tasksRes.tasks)) setTasks(tasksRes.tasks);
    } catch (e) {
      console.warn('Error pre-fetching CRM search data:', e.message);
    }
  };

  // Trigger data re-fetch on pathname changes (when user navigates) to keep search indexes fresh
  useEffect(() => {
    if (user) {
      fetchCRMData();
    }
  }, [pathname, user]);

  const isLoginRoute = pathname === '/login';

  // Beautiful Apple Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 dark:bg-[#0b0f17]">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
        <p className="mt-4 text-xs font-medium text-neutral-400 dark:text-neutral-500 tracking-wide">
          Syncing Sales Dashboard...
        </p>
      </div>
    );
  }

  // Login view: Plain layout
  if (isLoginRoute) {
    return (
      <>
        <main>{children}</main>
        <Toaster position="top-right" theme={theme} richColors />
      </>
    );
  }

  // Dashboard view: Full sidebar & header structure
  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-[#0b0f17]">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-grow p-6 md:p-8 animate-fade-in max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <CommandPalette />
      <Toaster position="top-right" theme={theme} richColors />
    </div>
  );
}
