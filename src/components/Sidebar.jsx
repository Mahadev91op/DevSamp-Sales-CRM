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
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Leads', icon: Users, path: '/leads' },
    { name: 'Medical Shops', icon: Store, path: '/shops' },
    { name: 'Visits Log', icon: MapPin, path: '/visits' },
    { name: 'Sales Pipeline', icon: GitBranch, path: '/pipeline' },
    { name: 'Tasks & Calendar', icon: CheckSquare, path: '/tasks' },
    { name: 'Trials & Subs', icon: Layers, path: '/trials' },
    { name: 'Reports & Analytics', icon: TrendingUp, path: '/reports' },
    { name: 'Documents', icon: FileText, path: '/documents' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const filteredMenu = menuItems;

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
        <div className="flex items-center gap-3 px-6 h-16 border-b border-neutral-100">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0071e3] text-white font-bold text-lg shadow-sm">
            D
          </div>
          <div>
            <h1 className="font-semibold text-black text-[15px] leading-tight">DevSamp CRM</h1>
            <span className="text-[10px] text-neutral-400 font-medium tracking-wider uppercase">Sales Suite</span>
          </div>
        </div>

        {/* User Info Capsule */}
        {user && (
          <div className="p-4 mx-4 my-3 rounded-xl bg-neutral-50 border border-neutral-200/50">
            <div className="flex items-center gap-3">
              <img 
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                alt="Avatar" 
                className="w-9 h-9 rounded-full object-cover border border-neutral-200"
              />
              <div className="overflow-hidden">
                <p className="font-semibold text-xs text-black truncate">{user.name}</p>
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#0071e3]/10 text-[#0071e3] mt-0.5">
                  Full Access
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
                    ? 'bg-[#0071e3] text-white shadow-xs font-semibold' 
                    : 'text-neutral-700 hover:bg-neutral-50 hover:text-black'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
