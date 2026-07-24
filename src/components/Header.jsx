'use client';

import { useStore } from '@/lib/store';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header({ onMenuClick }) {
  const pathname = usePathname();
  const { theme, toggleTheme, user, setCommandPaletteOpen } = useStore();
  const [scrolled, setScrolled] = useState(false);

  // Set header styling on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
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
    if (mainPage === 'visits') return 'Visits Logger';
    if (mainPage === 'trials') return 'Trials & Subscriptions';
    if (mainPage === 'reports') return 'Analytics & Reports';
    
    return capitalize(mainPage);
  };

  return (
    <header 
      className={`sticky top-0 z-30 flex items-center justify-between px-6 h-16 transition-all duration-200 ${
        scrolled 
          ? 'bg-white/80 dark:bg-[#0b0f17]/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      {/* Left section: Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-1.5 -ml-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{getPageTitle()}</h2>
        </div>
      </div>

      {/* Right section: Actions */}
      <div className="flex items-center gap-4">
        {/* Search capsule trigger */}
        <button 
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 w-64 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#131b26] hover:bg-neutral-100 dark:hover:bg-[#172230] text-neutral-400 text-xs text-left transition-all"
        >
          <Search className="w-3.5 h-3.5 text-neutral-400" />
          <span>Search CRM...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1a2330] px-1 font-mono text-[9px] font-medium text-neutral-400 shadow-sm">
            <span>⌘</span>K
          </kbd>
        </button>

        {/* Mobile search trigger */}
        <button 
          onClick={() => setCommandPaletteOpen(true)}
          className="p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-[#131b26] rounded-full md:hidden"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-[#131b26] rounded-full transition-all"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Notifications Icon (Mocked) */}
        <div className="relative">
          <button className="p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-[#131b26] rounded-full relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-600 dark:bg-sky-400 rounded-full" />
          </button>
        </div>

        {/* User Mini Profile */}
        {user && (
          <div className="flex items-center gap-2 border-l border-neutral-100 dark:border-neutral-800 pl-3">
            <img 
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
              alt="Profile" 
              className="w-7 h-7 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
            />
          </div>
        )}
      </div>
    </header>
  );
}
