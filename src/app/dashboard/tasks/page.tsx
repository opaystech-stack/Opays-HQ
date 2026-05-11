"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Plus } from 'lucide-react';
import TaskItem from '@/components/TaskItem';
import NewTaskModal from '@/components/modals/NewTaskModal';

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tasks')
      .select('*, projects(title), profiles(full_name), task_comments(*, profiles(full_name))')
      .order('due_date', { ascending: true });
    if (data) setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="p-8 space-y-8 text-white">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Mes Tâches</h1>
          <p className="text-zinc-500 mt-2">Suivez vos objectifs opérationnels en temps réel.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} /> Nouvelle Tâche
        </button>
      </header>

      <div className="flex gap-4">
        {['TODO', 'DOING', 'DONE'].map((status) => (
          <div key={status} className="bg-zinc-900/30 border border-zinc-800 rounded-2xl px-4 py-2 flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{status}</span>
            <span className="bg-zinc-800 px-2 py-0.5 rounded text-xs font-bold">
              {tasks?.filter(t => t.status === status).length || 0}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {tasks?.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}

        {!loading && !tasks.length && (
          <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
            <p className="text-zinc-500 italic">Aucune tâche en cours. Vous êtes à jour !</p>
          </div>
        )}
      </div>

      <NewTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTasks} 
      />
    </div>
  );
}
