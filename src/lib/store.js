import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  theme: 'light',
  toggleTheme: () => {},
  setTheme: (theme) => set({ theme: 'light' }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  leads: [],
  setLeads: (leads) => set({ leads }),
  updateLeadStatus: (leadId, status) => set((state) => {
    const updated = state.leads.map(l => l.id === leadId ? { ...l, status } : l);
    return { leads: updated };
  }),

  shops: [],
  setShops: (shops) => set({ shops }),

  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  toggleTask: (taskId) => set((state) => {
    const updated = state.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    return { tasks: updated };
  }),
}));
