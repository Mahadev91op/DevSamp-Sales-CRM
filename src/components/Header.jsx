'use client';

import { useStore } from '@/lib/store';
import { usePathname } from 'next/navigation';
import { Menu, Search, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header({ onMenuClick }) {
  const pathname = usePathname();
  const { user, setCommandPaletteOpen } = useStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Overview';
    const mainPage = segments[0];
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    if (mainPage === 'shops') return 'Medical Shops';
    if (mainPage === 'pipeline') return 'Sales Pipeline';
    if (mainPage === 'visits') return 'Visits Log';
    if (mainPage === 'trials') return 'Trials & Subscriptions';
    if (mainPage === 'reports') return 'Reports & Analytics';
    return capitalize(mainPage);
  };

  return (
    <header className={`sticky top-0 z-30 flex items-center justify-between px-5 h-14 transition-all duration-200 ${
      scrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'bg-white border-b border-gray-100'
    }`}>
      {/* Left: Menu + Title */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-bold text-gray-900">{getPageTitle()}</h2>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Desktop Search */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-2 w-56 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-400 text-xs text-left transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search CRM...</span>
          <kbd className="ml-auto px-1.5 py-0.5 rounded border border-gray-200 bg-white font-mono text-[9px] text-gray-400">⌘K</kbd>
        </button>

        {/* Mobile Search */}
        <button onClick={() => setCommandPaletteOpen(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full md:hidden transition-colors">
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#0071e3] rounded-full" />
        </button>

        {/* User Avatar */}
        {user && (
          <div className="flex items-center gap-2 border-l border-gray-100 pl-3 ml-1">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border-2 border-blue-100"
            />
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-gray-800 leading-none">{user.name}</p>
              <p className="text-[10px] text-[#0071e3] font-medium mt-0.5">Full Access</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
