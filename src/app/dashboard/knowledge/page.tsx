import { createServerSupabaseClient } from '@/lib/supabase-server';
import { BookOpen, GraduationCap, Lightbulb, Target } from 'lucide-react';

const IconMap: any = {
  'METHOD': <Target className="text-blue-500" size={24} />,
  'GUIDE': <GraduationCap className="text-green-500" size={24} />,
  'VISION': <Lightbulb className="text-yellow-500" size={24} />,
  'TECH': <BookOpen className="text-purple-500" size={24} />,
};

export default async function KnowledgePage() {
  const supabase = await createServerSupabaseClient();
  const { data: articles } = await supabase
    .from('knowledge_articles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-8 space-y-8 text-white">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Les Ficelles du Métier</h1>
        <p className="text-zinc-500 mt-2">Le savoir-faire d'OPAYS TECH, accessible en un clic.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles?.map((article) => (
          <div key={article.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all group">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-800 rounded-xl group-hover:bg-zinc-700 transition-colors">
                {IconMap[article.category] || <BookOpen size={24} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold">{article.title}</h2>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-zinc-800 text-zinc-400 rounded">
                    {article.category}
                  </span>
                </div>
                <div className="mt-4 text-zinc-400 text-sm leading-relaxed line-clamp-4 whitespace-pre-wrap">
                  {article.content}
                </div>
                <button className="mt-6 text-xs font-bold text-white border-b border-white/20 hover:border-white transition-all pb-1">
                  Lire le guide complet →
                </button>
              </div>
            </div>
          </div>
        ))}

        {!articles?.length && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
            <p className="text-zinc-500 italic">Aucun guide disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
