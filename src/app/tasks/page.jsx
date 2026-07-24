'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Plus, 
  Trash, 
  Check, 
  AlertCircle,
  X,
  Clock,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function Tasks() {
  const { tasks, setTasks } = useStore();
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch (e) {
      toast.error('Error fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleTask = async (taskId, currentCompleted) => {
    // Optimistic toggle
    const currentTasks = [...tasks];
    const toggled = tasks.map(t => t.id === taskId ? { ...t, completed: !currentCompleted } : t);
    setTasks(toggled);

    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, completed: !currentCompleted })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setTasks(currentTasks);
        toast.error('Failed to update task state');
      } else {
        toast.success(currentCompleted ? 'Task marked incomplete' : 'Task completed!');
      }
    } catch (err) {
      setTasks(currentTasks);
      toast.error('Network error during task update');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title || !deadline) {
      toast.error('Required fields are missing');
      return;
    }

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority, deadline, isRecurring })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Task created successfully');
        fetchTasks();
        setShowAddModal(false);
        // Reset form
        setTitle(''); setDescription(''); setDeadline(new Date().toISOString().split('T')[0]);
      } else {
        toast.error(data.error || 'Failed to create task');
      }
    } catch (e) {
      toast.error('Error creating task');
    }
  };

  // Generate Calendar Days (Current Month Grid)
  const getCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // Day of week (0-6)
    const numDays = new Date(year, month + 1, 0).getDate(); // Days in month

    const days = [];
    // Pad first days if month doesn't start on Sunday
    const startPad = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Mon starts row
    for (let i = 0; i < startPad; i++) {
      days.push(null);
    }

    for (let d = 1; d <= numDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNum: d, dateStr });
    }

    return days;
  };

  const calendarDays = getCalendarDays();
  const weekNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Filter tasks for selected date in Calendar
  const calendarTasks = (tasks || []).filter(t => t.deadline === selectedDate);
  const activeTasks = (tasks || []).filter(t => !t.completed);
  const completedTasks = (tasks || []).filter(t => t.completed);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Tasks & Calendar</h1>
          <p className="text-xs text-gray-400 mt-1">Assign checklist tasks and review follow ups</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Assign Task
        </button>
      </div>

      {/* Grid: Task list & Calendar view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Task list Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Checklist */}
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-600" />
              Active Checklists ({activeTasks.length})
            </h3>
            
            <div className="space-y-3">
              {loading ? (
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              ) : activeTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  All tasks complete! Great job.
                </div>
              ) : (
                activeTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all"
                  >
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id, task.completed)}
                      className="mt-1 w-4.5 h-4.5 rounded border-neutral-300 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900">{task.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{task.description}</p>
                      
                      <div className="flex items-center gap-3 mt-3 text-[10px]">
                        <span className={`font-semibold ${
                          task.priority === 'High' ? 'text-red-500' : task.priority === 'Medium' ? 'text-amber-500' : 'text-blue-500'
                        }`}>
                          {task.priority} Priority
                        </span>
                        <span className="text-gray-400">Due: {task.deadline}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Completed Checklist */}
          {completedTasks.length > 0 && (
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-semibold text-gray-400">
                Completed Tasks ({completedTasks.length})
              </h3>
              <div className="space-y-2 opacity-60">
                {completedTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-neutral-50">
                    <input 
                      type="checkbox" checked={true} 
                      onChange={() => handleToggleTask(task.id, true)}
                      className="w-4.5 h-4.5 rounded border-neutral-300 text-blue-600"
                    />
                    <p className="text-xs font-medium text-gray-700 line-through truncate">{task.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Calendar list (1/3 width) */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              Calendar Scheduler
            </h3>

            {/* Custom Month selector grid */}
            <div>
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 mb-2">
                {weekNames.map((w, idx) => (
                  <div key={idx}>{w}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  if (!day) return <div key={`pad-${idx}`} className="h-8" />;
                  const isSelected = day.dateStr === selectedDate;
                  const hasTasks = tasks && tasks.some(t => t.deadline === day.dateStr);

                  return (
                    <button
                      key={day.dateStr}
                      onClick={() => setSelectedDate(day.dateStr)}
                      className={`h-8 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      {day.dayNum}
                      {hasTasks && !isSelected && (
                        <span className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tasks scheduled on this day list */}
            <div className="pt-4 border-t border-neutral-50 space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Appointments for {selectedDate}
              </p>

              {calendarTasks.length === 0 ? (
                <p className="text-[10px] text-gray-400 text-center py-4">No follow ups booked for this day</p>
              ) : (
                calendarTasks.map(task => (
                  <div key={task.id} className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl space-y-1">
                    <p className="text-xs font-semibold text-blue-700">{task.title}</p>
                    <p className="text-[9px] text-gray-500">{task.description || 'No description notes.'}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-sm font-bold text-gray-900 mb-6">Assign New Task</h2>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Task Title *</label>
                <input 
                  required value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Call client for demo followup" className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Task Description</label>
                <textarea 
                  rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Discuss yearly license pricing plans and discounts..." className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Priority</label>
                  <select 
                    value={priority} onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Deadline *</label>
                  <input 
                    type="date" required value={deadline} onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  id="isRecurring" type="checkbox" 
                  checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-gray-50 border-neutral-300"
                />
                <label htmlFor="isRecurring" className="text-[10px] text-gray-500 font-semibold">
                  This is a recurring task (e.g. daily/weekly report)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
