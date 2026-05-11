"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Lightbulb, ThumbsUp, MessageSquare, Tag } from 'lucide-react';
import NewIdeaModal from '@/components/modals/NewIdeaModal';

const CategoryColors: any = {
  'TECH': 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  'SALES': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  'OPS': 'text-green-500 bg-green-500/10 border-green-500/20',
  'OTHER': 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20',
};

export default function IdeasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchIdeas = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ideas')
      .select('*, profiles(full_name)')
      .order('votes', { ascending: false });
    if (data) setIdeas(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  return (
    <div className="p-8 space-y-8 text-white">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Boîte à Idées</h1>
          <p className="text-zinc-500 mt-2">Partagez vos visions et proposez des innovations pour OPAYS TECH.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-yellow-500 text-black font-bold rounded-xl flex items-center gap-2 hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20"
        >
          <Lightbulb size={18} /> Proposer une idée
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map((idea) => (
          <div key={idea.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-all">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className={`px-2 py-1 text-[10px] font-bold rounded border uppercase tracking-widest ${CategoryColors[idea.category]}`}>
                  {idea.category}
                </span>
                <span className="text-[10px] text-zinc-600 font-bold uppercase">{idea.status}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold leading-tight">{idea.title}</h3>
                <p className="text-sm text-zinc-500 mt-2 line-clamp-3">{idea.description}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700" title={idea.profiles?.full_name}></div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{idea.profiles?.full_name?.split(' ')[0] || 'Inconnu'}</span>
              </div>
              <div className="flex gap-4">
                <button className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
                  <ThumbsUp size={16} />
                  <span className="text-xs font-bold">{idea.votes}</span>
                </button>
                <button className="text-zinc-400 hover:text-white transition-colors">
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!loading && !ideas.length && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-600 italic">
            Aucune idée proposée pour le moment.
          </div>
        )}
      </div>

      <NewIdeaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchIdeas} 
      />
    </div>
  );
}
