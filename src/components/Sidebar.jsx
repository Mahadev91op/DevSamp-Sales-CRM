'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import {
  LayoutDashboard, Users, Store, MapPin, GitBranch,
  CheckSquare, TrendingUp, Settings, LogOut,
  Layers, FileText, X
} from 'lucide-react';
import { toast } from 'sonner';

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useStore();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        toast.success('Logged out successfully');
        router.push('/login');
      } else {
        toast.error('Logout failed');
      }
    } catch (e) {
      toast.error('Logout error');
    }
  };

  const menuItems = [
    { name: 'Dashboard',          icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Leads',               icon: Users,           path: '/leads' },
    { name: 'Medical Shops',       icon: Store,           path: '/shops' },
    { name: 'Visits Log',          icon: MapPin,          path: '/visits' },
    { name: 'Sales Pipeline',      icon: GitBranch,       path: '/pipeline' },
    { name: 'Tasks & Calendar',    icon: CheckSquare,     path: '/tasks' },
    { name: 'Trials & Subs',       icon: Layers,          path: '/trials' },
    { name: 'Reports & Analytics', icon: TrendingUp,      path: '/reports' },
    { name: 'Documents',           icon: FileText,        path: '/documents' },
    { name: 'Settings',            icon: Settings,        path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-gray-100 shadow-sm transition-transform duration-300 lg:translate-x-0 lg:static lg:shadow-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>

        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0071e3] text-white font-bold text-base flex items-center justify-center shadow-md shadow-blue-200">
              D
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-[14px] leading-none">DevSamp CRM</h1>
              <span className="text-[9px] text-gray-400 font-medium tracking-widest uppercase">Sales Suite</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile Capsule */}
        {user && (
          <div className="mx-4 my-3 p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border-2 border-blue-200"
              />
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="font-semibold text-xs text-gray-900 truncate">{user.name}</p>
                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#0071e3] text-white mt-0.5">
                  Full Access
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#0071e3] text-white shadow-md shadow-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="truncate">{item.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
