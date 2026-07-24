'use client';

import { useEffect, useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Search, User, Store, CheckSquare, Plus, Sun, Moon, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function CommandPalette() {
  const router = useRouter();
  const { 
    commandPaletteOpen, 
    setCommandPaletteOpen, 
    toggleTheme, 
    setUser, 
    leads, 
    shops, 
    tasks 
  } = useStore();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ leads: [], shops: [], tasks: [] });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Toggle Command Palette on Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Focus input on open
  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  // Handle local searching across loaded store data
  useEffect(() => {
    if (!query) {
      setResults({ leads: [], shops: [], tasks: [] });
      return;
    }

    const cleanQuery = query.toLowerCase();

    const filteredLeads = leads.filter(
      (l) => l.name?.toLowerCase().includes(cleanQuery) || l.phone?.includes(cleanQuery)
    ).slice(0, 3);

    const filteredShops = shops.filter(
      (s) => s.storeName?.toLowerCase().includes(cleanQuery) || s.ownerName?.toLowerCase().includes(cleanQuery)
    ).slice(0, 3);

    const filteredTasks = tasks.filter(
      (t) => t.title?.toLowerCase().includes(cleanQuery)
    ).slice(0, 3);

    setResults({ leads: filteredLeads, shops: filteredShops, tasks: filteredTasks });
    setSelectedIndex(0);
  }, [query, leads, shops, tasks]);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setCommandPaletteOpen(false);
      }
    };
    if (commandPaletteOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const handleNavigate = (path) => {
    router.push(path);
    setCommandPaletteOpen(false);
  };

  const handleAction = (actionFn) => {
    actionFn();
    setCommandPaletteOpen(false);
  };

  // Keyboard navigation through search items
  const allResults = [
    ...results.leads.map(l => ({ type: 'lead', name: l.name, sub: l.phone, path: '/leads', icon: User })),
    ...results.shops.map(s => ({ type: 'shop', name: s.storeName, sub: s.ownerName, path: '/shops', icon: Store })),
    ...results.tasks.map(t => ({ type: 'task', name: t.title, sub: t.deadline, path: '/tasks', icon: CheckSquare })),
    { type: 'action', name: 'Go to Pipeline', sub: 'Kanban board', path: '/pipeline', icon: Plus },
    { type: 'action', name: 'Toggle Dark Mode', sub: 'Switch colors', action: toggleTheme, icon: Sun },
    { type: 'action', name: 'Logout', sub: 'End CRM session', action: async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    }, icon: LogOut }
  ];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allResults.length) % allResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = allResults[selectedIndex];
      if (selected) {
        if (selected.action) handleAction(selected.action);
        else if (selected.path) handleNavigate(selected.path);
      }
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/45 backdrop-blur-xs">
          <motion.div 
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="w-full max-w-lg overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-2xl"
            onKeyDown={handleKeyDown}
          >
            {/* Input Bar */}
            <div className="flex items-center gap-3 px-4 h-12 border-b border-gray-100">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search leads, shops, tasks or type command..."
                className="flex-1 bg-transparent border-0 outline-none text-xs text-gray-900 placeholder-neutral-400 py-2"
              />
              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">ESC</span>
            </div>

            {/* List Body */}
            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {allResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No results found for "{query}"
                </div>
              ) : (
                allResults.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => item.action ? handleAction(item.action) : handleNavigate(item.path)}
                      className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-all ${
                        isSelected 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                      <div className="truncate">
                        <p className="text-xs font-medium leading-none">{item.name}</p>
                        <span className={`text-[10px] leading-tight ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                          {item.sub}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="ml-auto text-[9px] font-semibold tracking-wider text-blue-100 uppercase">
                          Enter
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
