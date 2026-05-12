"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase';
import {
  BookOpen,
  GraduationCap,
  Lightbulb,
  Target,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  FileText,
  Shield,
  CalendarDays,
  Search,
} from 'lucide-react';
import NewKnowledgeModal from '@/components/modals/NewKnowledgeModal';

const IconMap: Record<string, React.ReactNode> = {
  METHOD: <Target className="text-cyan-300" size={22} />,
  GUIDE: <GraduationCap className="text-emerald-300" size={22} />,
  VISION: <Lightbulb className="text-amber-300" size={22} />,
  TECH: <BookOpen className="text-violet-300" size={22} />,
};

const CategoryLabel: Record<string, string> = {
  METHOD: 'Méthode',
  GUIDE: 'Guide',
  VISION: 'Vision',
  TECH: 'Tech',
};

const featuredGuides = [
  {
    id: 'featured-ai-native',
    title: 'Pourquoi Opays doit être AI-Native',
    category: 'VISION',
    target_role: 'ALL',
    created_at: new Date().toISOString(),
    content: `# Q: Qu'est-ce qu'une entreprise AI-Native ?
### R:
- Une entreprise AI-Native ne colle pas l'IA à la fin du processus.
- Elle conçoit l'opérationnel, le produit, le support et la vente autour d'agents IA dès le départ.

## Q: Pourquoi cela change tout ?
### R:
- Les décisions deviennent plus rapides.
- Les tâches répétitives sortent du chemin humain.
- L'équipe se concentre sur le jugement, la relation client et la création de valeur.

## Q: Qu'est-ce qu'on reprend de ce modèle ?
### R:
- La vitesse d'itération.
- L'usage de l'IA comme couche d'exécution.
- La documentation comme actif stratégique.

## Q: Qu'est-ce qu'on refuse de copier ?
### R:
- Le bruit marketing sans impact opérationnel.
- Les promesses floues du type "IA pour tout".
- Les workflows qui sacrifient la souveraineté des données.`,
  },
  {
    id: 'featured-automation',
    title: 'Automatiser 80% des tâches répétitives avec des agents',
    category: 'METHOD',
    target_role: 'ALL',
    created_at: new Date().toISOString(),
    content: `# Q: Qu'est-ce qu'on automatise en premier ?
### R:
- Tout ce qui est répétitif, prévisible et mesurable: tri, relances, synthèses, reporting, affectation, classement.

## Q: Pourquoi commencer par les répétitions ?
### R:
- Parce que ce sont les tâches où l'IA apporte le plus de temps gagné pour le moins de risque.
- Parce qu'elles produisent vite un retour visible pour l'équipe.

## Q: Quel est le bon ordre ?
### R:
1. Identifier la tâche.
2. Décrire la règle.
3. Ajouter une validation humaine.
4. Connecter l'agent aux données.
5. Mesurer l'avant et l'après.

## Q: Quel est le piège à éviter ?
### R:
- Automatiser un chaos mal défini.
- Supprimer le contrôle humain sur les étapes sensibles.
- Ajouter dix outils au lieu de simplifier le flux.`,
  },
  {
    id: 'featured-commando',
    title: 'Le Cycle Commando pour nos sprints hebdomadaires',
    category: 'GUIDE',
    target_role: 'ALL',
    created_at: new Date().toISOString(),
    content: `# Q: C'est quoi le Cycle Commando ?
### R:
- Une cadence courte, agressive et lisible.
- L'objectif n'est pas de faire "beaucoup", mais de livrer quelque chose de net chaque semaine.

## Q: Comment on l'applique ?
### R:
1. Lundi: définir une seule victoire critique.
2. Mardi-Mercredi: exécution profonde.
3. Jeudi: validation, QA, itérations.
4. Vendredi: livraison, documentation, rétro.

## Q: Pourquoi ça marche avec une petite équipe ?
### R:
- Parce qu'une équipe de cinq personnes ne peut pas se permettre la dispersion.
- Les rôles deviennent complémentaires et les dépendances restent visibles.

## Q: Quelle discipline garder ?
### R:
- Une mission prioritaire par personne.
- Un dashboard lisible.
- Un point de blocage unique par jour.`,
  },
  {
    id: 'featured-sovereignty',
    title: 'Souveraineté des données avec des modèles mondiaux',
    category: 'TECH',
    target_role: 'ALL',
    created_at: new Date().toISOString(),
    content: `# Q: Peut-on utiliser des modèles mondiaux sans perdre notre souveraineté ?
### R:
- Oui, si nous gardons le contrôle des données, des permissions et des flux.

## Q: Quelle est la règle d'or ?
### R:
- Les modèles peuvent être mondiaux.
- Les données, la logique métier et les accès doivent rester sous notre contrôle.

## Q: Qu'est-ce qu'on doit protéger en priorité ?
### R:
- Les profils, les tâches, la trésorerie, les contrats et les savoir-faire internes.

## Q: Comment on réduit le risque ?
### R:
- RBAC strict.
- Journalisation des actions.
- Séparation claire entre lecture, écriture et validation humaine.

## Q: Quel est le bon état d'esprit ?
### R:
- Utiliser l'IA comme moteur.
- Garder l'entreprise comme pilote.`,
  },
  {
    id: 'featured-copy-adapt',
    title: "Ce qu'on copie de la vidéo et ce qu'on adapte",
    category: 'VISION',
    target_role: 'ALL',
    created_at: new Date().toISOString(),
    content: `# Q: Qu'est-ce qu'on peut reprendre sans conflit avec notre vision ?
### R:
- La vitesse d'exécution.
- La discipline de test.
- La culture du prototype utile.
- La mise en avant du résultat, pas du buzz.

## Q: Qu'est-ce qu'on doit adapter ?
### R:
- Le langage.
- Le rythme.
- Les priorités métier.
- Le niveau de souveraineté requis pour nos clients et notre contexte.

## Q: Qu'est-ce qu'on ne doit pas importer ?
### R:
- Le culte du "move fast and break things" quand il casse la confiance.
- Les produits sans profondeur métier.
- Les processus qui dépendent d'une équipe trop large ou trop coûteuse.

## Q: Quelle est la vraie leçon ?
### R:
- On ne copie pas une esthétique.
- On copie une méthode d'exécution, puis on la rend locale, robuste et rentable.`,
  },
];

function renderContent(content: string) {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (!listItems.length) return;
    nodes.push(
      <ul key={`${keyPrefix}-list-${nodes.length}`} className="space-y-2">
        {listItems.map((item, index) => (
          <li key={`${keyPrefix}-item-${index}`} className="flex gap-3 text-slate-200">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(`blank-${index}`);
      nodes.push(<div key={`space-${index}`} className="h-2" />);
      return;
    }

    if (trimmed.startsWith('# ')) {
      flushList(`h1-${index}`);
      nodes.push(
        <h2 key={`h1-${index}`} className="text-xl font-semibold tracking-tight text-white">
          {trimmed.replace(/^#\s+/, '')}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList(`h2-${index}`);
      nodes.push(
        <h3 key={`h2-${index}`} className="text-base font-semibold uppercase tracking-[0.22em] text-cyan-300">
          {trimmed.replace(/^##\s+/, '')}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList(`h3-${index}`);
      nodes.push(
        <h4 key={`h3-${index}`} className="text-sm font-semibold text-slate-100">
          {trimmed.replace(/^###\s+/, '')}
        </h4>
      );
      return;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      listItems.push(trimmed.replace(/^[-*]\s+/, ''));
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      listItems.push(trimmed.replace(/^\d+\.\s+/, ''));
      return;
    }

    flushList(`p-${index}`);
    nodes.push(
      <p key={`p-${index}`} className="leading-relaxed text-slate-200">
        {trimmed}
      </p>
    );
  });

  flushList('end');
  return nodes;
}

export default function KnowledgePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      setProfile(profileData);
    }

    const { data } = await supabase
      .from('knowledge_articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setArticles(data);
      setActiveArticleId((current) => current ?? data[0]?.id ?? null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteArticle = async (id: string) => {
    if (confirm("Supprimer ce guide ?")) {
      const { error } = await supabase.from('knowledge_articles').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  const isAdmin = ['CEO', 'COO', 'ADMIN'].includes(profile?.role || '');

  const filteredArticles = useMemo(() => {
    const term = search.trim().toLowerCase();
    const pool = [...featuredGuides, ...articles];
    const uniquePool = pool.filter((article, index, self) => self.findIndex((item) => item.title === article.title) === index);
    if (!term) return uniquePool;
    return uniquePool.filter((article) =>
      [article.title, article.content, article.category, article.target_role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [articles, search]);

  const activeArticle = filteredArticles.find((article) => article.id === activeArticleId) || filteredArticles[0] || articles[0];

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050816] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.12),_transparent_28%),linear-gradient(180deg,#050816_0%,#090d1d_58%,#0b1020_100%)]" />
      <div className="relative z-10 mx-auto max-w-[1600px] space-y-8 p-6 md:p-8">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-200 backdrop-blur">
              <Sparkles size={12} /> Knowledge Base
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">Guide & Savoir-faire</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Le manuel pratique d'OPAYS TECH, pensé pour la lecture rapide, la montée en compétence et l'exécution autonome.
              </p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-black/20 backdrop-blur-xl transition hover:bg-white/15"
            >
              <Plus size={18} /> Nouveau Guide
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Base de savoir</p>
                <h2 className="mt-1 text-lg font-semibold text-white">{filteredArticles.length} articles</h2>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher une méthode, un guide..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500/40"
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredArticles.map((article) => {
                const active = article.id === activeArticle?.id;
                return (
                  <button
                    key={article.id}
                    onClick={() => setActiveArticleId(article.id)}
                    className={`group rounded-[1.75rem] border p-5 text-left transition-all ${
                      active
                        ? 'border-cyan-500/30 bg-cyan-500/10 shadow-xl shadow-cyan-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          {IconMap[article.category] || <BookOpen size={22} className="text-slate-300" />}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white">{article.title}</h3>
                          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                            {CategoryLabel[article.category] || article.category} • {article.target_role || 'ALL'}
                          </p>
                        </div>
                      </div>
                      {active && <ArrowRight size={16} className="mt-1 text-cyan-300" />}
                    </div>

                    <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-300">
                      {article.content}
                    </p>
                  </button>
                );
              })}

              {!loading && !filteredArticles.length && (
                <div className="col-span-full rounded-[2rem] border border-dashed border-white/10 py-20 text-center">
                  <p className="italic text-slate-500">Aucun guide disponible pour le moment.</p>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              {activeArticle ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300">
                        {CategoryLabel[activeArticle.category] || activeArticle.category}
                      </div>
                      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">{activeArticle.title}</h2>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                          <Shield size={12} /> {activeArticle.target_role || 'ALL'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                          <CalendarDays size={12} /> {new Date(activeArticle.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => deleteArticle(activeArticle.id)}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="mt-6 space-y-4 rounded-[1.5rem] border border-white/10 bg-[#070b18] p-5">
                    {renderContent(activeArticle.content)}
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Lecture</p>
                      <p className="mt-2 text-sm font-semibold text-white">Directement dans l'app</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Usage</p>
                      <p className="mt-2 text-sm font-semibold text-white">Formation d'équipe</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Rôle cible</p>
                      <p className="mt-2 text-sm font-semibold text-white">{activeArticle.target_role || 'ALL'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-24 text-center">
                  <BookOpen size={40} className="mx-auto text-slate-500" />
                  <p className="mt-4 text-sm text-slate-400">Sélectionne un guide pour le lire ici.</p>
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-cyan-300">
                <FileText size={16} />
                <h3 className="text-xs font-bold uppercase tracking-[0.28em] text-slate-300">Usage recommandé</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Ces guides sont pensés comme des blocs de savoir immédiatement exploitables par l'équipe. On y conserve la stratégie,
                mais on l'adapte à notre culture: souveraineté, vitesse d'exécution et discipline opérationnelle.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <NewKnowledgeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
