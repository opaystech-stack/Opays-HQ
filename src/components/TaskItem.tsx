"use client";

import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, ChevronDown, MessageSquare, Send } from 'lucide-react';

const PriorityColors: any = {
  'LOW': 'text-zinc-500',
  'MEDIUM': 'text-blue-500',
  'HIGH': 'text-orange-500',
  'URGENT': 'text-red-500',
};

const StatusIcons: any = {
  'TODO': <div className="w-5 h-5 rounded-full border-2 border-zinc-700" />,
  'DOING': <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />,
  'DONE': <CheckCircle2 className="text-green-500" size={20} />,
};

export default function TaskItem({ task }: { task: any }) {
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState('');

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all group space-y-4">
      <div className="flex items-center gap-6">
        <button className="flex-shrink-0 hover:scale-110 transition-transform">
          {StatusIcons[task.status]}
        </button>
        
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-3 mb-1">
            <h3 className={`font-bold truncate ${task.status === 'DONE' ? 'text-zinc-500 line-through' : 'text-white'}`}>
              {task.title}
            </h3>
            <span className={`text-[10px] font-black ${PriorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock size={12} /> {task.due_date ? new Date(task.due_date).toLocaleDateString('fr-FR') : 'Sans date'}
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle size={12} /> {task.projects?.title || 'Tâche Interne'}
            </span>
            <span className="flex items-center gap-1">
               <MessageSquare size={12} /> {task.task_comments?.length || 0}
            </span>
          </div>
        </div>

        <button onClick={() => setExpanded(!expanded)} className={`text-zinc-700 hover:text-zinc-400 transition-all ${expanded ? 'rotate-180' : ''}`}>
          <ChevronDown size={20} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-zinc-800 pt-4 space-y-4 animate-in fade-in duration-300">
          <div className="space-y-3">
            {task.task_comments?.map((c: any) => (
              <div key={c.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-zinc-400">{c.profiles?.full_name}</span>
                  <span className="text-[10px] text-zinc-600">{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-zinc-300">{c.content}</p>
              </div>
            ))}
            {!task.task_comments?.length && <p className="text-[10px] text-zinc-600 italic px-2">Aucun commentaire pour le moment.</p>}
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ajouter un commentaire..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs focus:border-blue-500 outline-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
