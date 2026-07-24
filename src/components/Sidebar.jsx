'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  MapPin, 
  GitBranch, 
  CheckSquare, 
  TrendingUp, 
  Settings, 
  LogOut,
  Sparkles,
  Layers,
  FileText
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
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['Super Admin', 'Sales Manager', 'Sales Executive'] },
    { name: 'Leads', icon: Users, path: '/leads', roles: ['Super Admin', 'Sales Manager', 'Sales Executive'] },
    { name: 'Medical Shops', icon: Store, path: '/shops', roles: ['Super Admin', 'Sales Manager', 'Sales Executive'] },
    { name: 'Visits Log', icon: MapPin, path: '/visits', roles: ['Super Admin', 'Sales Manager', 'Sales Executive'] },
    { name: 'Sales Pipeline', icon: GitBranch, path: '/pipeline', roles: ['Super Admin', 'Sales Manager', 'Sales Executive'] },
    { name: 'Tasks & Calendar', icon: CheckSquare, path: '/tasks', roles: ['Super Admin', 'Sales Manager', 'Sales Executive'] },
    { name: 'Trials & Subs', icon: Layers, path: '/trials', roles: ['Super Admin', 'Sales Manager'] },
    { name: 'Reports & Analytics', icon: TrendingUp, path: '/reports', roles: ['Super Admin', 'Sales Manager'] },
    { name: 'Documents', icon: FileText, path: '/documents', roles: ['Super Admin', 'Sales Manager', 'Sales Executive'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['Super Admin', 'Sales Manager', 'Sales Executive'] },
  ];

  const filteredMenu = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-neutral-100 dark:bg-[#131b26] dark:border-neutral-800 transition-transform duration-300 lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-lg shadow-sm">
            D
          </div>
          <div>
            <h1 className="font-semibold text-neutral-800 dark:text-neutral-200 text-[15px] leading-tight">DevSamp CRM</h1>
            <span className="text-[10px] text-neutral-400 font-medium tracking-wider uppercase">Sales Suite</span>
          </div>
        </div>

        {/* User Info Capsule */}
        {user && (
          <div className="p-4 mx-4 my-3 rounded-xl bg-neutral-50 dark:bg-[#1c2635] border border-neutral-100/50 dark:border-neutral-800/50">
            <div className="flex items-center gap-3">
              <img 
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                alt="Avatar" 
                className="w-9 h-9 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
              />
              <div className="overflow-hidden">
                <p className="font-medium text-xs text-neutral-800 dark:text-neutral-200 truncate">{user.name}</p>
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mt-0.5">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <Link 
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-50/80 text-blue-600 dark:bg-blue-900/20 dark:text-sky-400' 
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-[#1a2330] hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-sky-400' : 'text-neutral-400 dark:text-neutral-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
