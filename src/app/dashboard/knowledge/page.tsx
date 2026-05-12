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
    title: 'Pourquoi Opays est une entreprise AI-Native',
    category: 'VISION',
    target_role: 'ALL',
    created_at: new Date().toISOString(),
    content: `# Q: Qu'est-ce qu'une entreprise AI-Native ?
### R:
- Une entreprise AI-Native utilise l'IA comme un réflexe de travail, pas comme un gadget.
- On s'en sert pour gagner du temps, mieux servir les clients et réduire les erreurs.

## Q: Pourquoi cela change tout ?
### R:
- Les décisions deviennent plus rapides.
- Les tâches répétitives prennent moins de place.
- L'équipe peut se concentrer sur le client, la qualité et la valeur réelle.

## Q: Qu'est-ce qu'on reprend de ce modèle ?
### R:
- La vitesse d'apprentissage.
- L'habitude de travailler avec des assistants IA.
- La documentation simple et utile.

## Q: Qu'est-ce qu'on refuse de copier ?
### R:
- Les promesses floues du type "l'IA fait tout".
- Les méthodes compliquées qui fatiguent l'équipe.
- Les outils qui mettent nos données en danger.`,
  },
  {
    id: 'featured-ai-helpers',
    title: 'Comment utiliser l’IA sans être technique',
    category: 'METHOD',
    target_role: 'ALL',
    created_at: new Date().toISOString(),
    content: `# Q: Est-ce qu'il faut savoir coder pour utiliser l'IA chez Opays ?
### R:
- Non. Il faut surtout savoir expliquer un besoin simplement.
- L'IA est là pour aider l'équipe, pas pour la remplacer.

## Q: À quoi peut m'aider l'IA au quotidien ?
### R:
- Résumer un texte.
- Rédiger un premier brouillon.
- Préparer une réponse client.
- Organiser des idées.
- Faire un tri rapide dans l'information.

## Q: Quelle est la bonne manière de demander ?
### R:
- Dire ce qu'on veut obtenir, pour qui, et dans quel format.
- Donner un exemple simple si possible.

## Q: Qu'est-ce qu'il faut éviter ?
### R:
- Les demandes vagues.
- Les instructions contradictoires.
- Laisser l'IA décider seule sur des sujets sensibles.

## Q: Comment savoir si le résultat est bon ?
### R:
- Le message est clair.
- Le ton correspond à l'entreprise.
- Le résultat peut être relu et corrigé facilement.`,
  },
  {
    id: 'featured-operations',
    title: 'Notre rythme de travail hebdomadaire',
    category: 'GUIDE',
    target_role: 'ALL',
    created_at: new Date().toISOString(),
    content: `# Q: Pourquoi avons-nous besoin d'un rythme commun ?
### R:
- Parce qu'une petite équipe doit savoir qui fait quoi, quand, et pour quel objectif.
- Le rythme commun évite la confusion et les doublons.

## Q: Comment organiser une semaine simple ?
### R:
1. Définir une priorité claire en début de semaine.
2. Avancer sans se disperser.
3. Vérifier ce qui bloque.
4. Partager les résultats.
5. Corriger avant de passer à la suite.

## Q: Pourquoi ce rythme est utile ?
### R:
- Chacun connaît le cap.
- Les efforts se voient.
- Les retards se détectent tôt.
- On garde de la place pour aider un collègue ou un client.`,
  },
  {
    id: 'featured-client-trust',
    title: 'Comment servir le client avec confiance',
    category: 'GUIDE',
    target_role: 'ALL',
    created_at: new Date().toISOString(),
    content: `# Q: Qu'est-ce qui compte le plus dans notre relation client ?
### R:
- La clarté.
- La fiabilité.
- La rapidité de réponse.
- Le respect de ce qu'on promet.

## Q: Que doit faire chaque membre de l'équipe ?
### R:
- Répondre proprement.
- Prévenir quand il y a un blocage.
- Dire la vérité plutôt que promettre trop vite.
- Garder le client informé.

## Q: Pourquoi c'est important ?
### R:
- Parce que la confiance se construit sur les petits gestes répétés.
- Parce qu'un bon service vaut souvent plus qu'un long discours.`,
  },
  {
    id: 'featured-data-safety',
    title: 'Protéger les informations de l’entreprise',
    category: 'TECH',
    target_role: 'ALL',
    created_at: new Date().toISOString(),
    content: `# Q: Pourquoi la confidentialité est-elle importante ?
### R:
- Parce que nos informations internes ont de la valeur.
- Parce qu'un bon niveau de discrétion protège l'équipe, le client et l'entreprise.

## Q: Qu'est-ce qu'on ne partage pas n'importe comment ?
### R:
- Les données clients.
- Les informations financières.
- Les accès techniques.
- Les documents internes sensibles.

## Q: Quel est le bon réflexe ?
### R:
- Si on n'est pas sûr, on demande.
- Si un accès semble inutile, on le signale.
- Si un document est sensible, on le partage seulement avec les bonnes personnes.`,
  },
  {
    id: 'featured-roles',
    title: 'Bien travailler ensemble dans une petite équipe',
    category: 'METHOD',
    target_role: 'ALL',
    created_at: new Date().toISOString(),
    content: `# Q: Pourquoi les rôles doivent être clairs ?
### R:
- Parce que quand tout le monde sait ce qu'il doit faire, l'équipe avance plus vite.

## Q: Qu'est-ce que chacun doit comprendre ?
### R:
- Son rôle.
- Son niveau de responsabilité.
- À qui demander de l'aide.
- Quand prévenir le reste de l'équipe.

## Q: Quelle attitude aide vraiment ?
### R:
- Être fiable.
- Être simple.
- Être réactif.
- Respecter le travail des autres.`,
  },
  {
    id: 'featured-adaptation',
    title: 'Ce qu’on apprend des autres sans se perdre',
    category: 'VISION',
    target_role: 'ALL',
    created_at: new Date().toISOString(),
    content: `# Q: Peut-on s'inspirer d'autres entreprises ?
### R:
- Oui, bien sûr.
- Mais on copie une méthode, pas une identité.

## Q: Qu'est-ce qu'on retient d'une inspiration extérieure ?
### R:
- La discipline.
- La vitesse.
- L'habitude de tester.
- La façon de rendre le travail plus clair.

## Q: Qu'est-ce qu'on adapte à Opays ?
### R:
- Notre culture.
- Notre contexte.
- Nos clients.
- Notre niveau d'exigence sur la confiance et la qualité.

## Q: Quelle est la règle finale ?
### R:
- On garde ce qui nous rend meilleurs.
- On laisse ce qui ne nous ressemble pas.`,
  },
  {
    id: 'featured-pitch',
    title: "Le pitch simple pour expliquer notre valeur",
    category: 'VISION',
    target_role: 'SALES',
    created_at: new Date().toISOString(),
    content: `# Q: Comment présenter Opays en une phrase ?
### R:
- Nous aidons les entreprises à enlever les lourdeurs qui leur font perdre du temps, de l'énergie et de l'argent.

## Q: Comment expliquer le bénéfice sans parler technique ?
### R:
- Nous simplifions le travail.
- Nous réduisons les erreurs.
- Nous accélérons les réponses.
- Nous remettons l'équipe sur ce qui compte vraiment.

## Q: Quelle image peut aider ?
### R:
- Imagine une entreprise qui porte trop de poids inutile.
- Notre rôle est d'enlever ce qui ralentit, pour qu'elle avance plus vite et plus facilement.

## Q: Que faut-il éviter ?
### R:
- Dire que l'IA est magique.
- Parler trop de technologie.
- Oublier le résultat concret pour le client.`,
  },
  {
    id: 'featured-audit-benefits',
    title: "Les bénéfices d'un audit IA",
    category: 'METHOD',
    target_role: 'SALES',
    created_at: new Date().toISOString(),
    content: `# Q: À quoi sert un audit IA ?
### R:
- À voir où le temps se perd.
- À repérer les erreurs répétées.
- À comprendre ce qui coûte trop d'effort.

## Q: Quels bénéfices met-on en avant ?
### R:
1. **Temps gagné** - moins d'heures perdues sur des tâches répétitives.
2. **Moins d'erreurs** - moins de corrections et de retours en arrière.
3. **Moins de friction** - le travail devient plus simple pour l'équipe.
4. **Moins de blocages** - l'information circule mieux.
5. **Meilleures priorités** - l'équipe se concentre sur ce qui crée de la valeur.

## Q: Comment le dire simplement ?
### R:
- L'audit montre ce qui ralentit votre entreprise.
- Ensuite, on propose une manière plus simple de travailler.`,
  },
  {
    id: 'featured-objections',
    title: 'Répondre aux objections sur la sécurité',
    category: 'GUIDE',
    target_role: 'SALES',
    created_at: new Date().toISOString(),
    content: `# Q: Que répondre si un client a peur pour ses données ?
### R:
- C'est une bonne question, et elle est normale.
- Nous travaillons justement pour protéger les informations et contrôler les accès.

## Q: Comment rassurer sans promettre trop ?
### R:
- Nous limitons ce qui est partagé.
- Nous définissons qui peut voir quoi.
- Nous gardons une trace des actions importantes.
- Nous ne mélangeons pas les données sensibles avec des usages inutiles.

## Q: Quelle phrase simple peut être utilisée ?
### R:
- L'IA nous aide à travailler plus vite, mais vos données restent sous contrôle.

## Q: Que faut-il éviter ?
### R:
- Minimiser la peur du client.
- Donner une réponse trop technique.
- Faire comme si la sécurité n'était pas importante.`,
  },
  {
    id: 'featured-value-proposal',
    title: 'Template de proposition de valeur',
    category: 'METHOD',
    target_role: 'SALES',
    created_at: new Date().toISOString(),
    content: `# Q: Quelle est l'idée d'une bonne proposition de valeur ?
### R:
- Montrer d'abord le problème, puis la solution, puis le résultat attendu.

## Q: Quelle structure utiliser ?
### R:
1. **Situation actuelle** - comment l'équipe travaille aujourd'hui.
2. **Point de blocage** - où se perd le temps ou l'énergie.
3. **Impact concret** - ce que cela coûte en pratique.
4. **Approche Opays** - comment nous simplifions le travail.
5. **Résultat attendu** - ce que le client gagne.

## Q: Pourquoi cette structure marche ?
### R:
- Parce qu'elle parle du vrai problème du client.
- Parce qu'elle reste simple à comprendre.
- Parce qu'elle montre la valeur avant la discussion finale.`,
  },
  {
    id: 'featured-discovery',
    title: 'Les bonnes questions avant de proposer',
    category: 'GUIDE',
    target_role: 'SALES',
    created_at: new Date().toISOString(),
    content: `# Q: Pourquoi poser de bonnes questions ?
### R:
- Parce qu'on ne peut pas proposer une vraie aide sans comprendre la situation.

## Q: Quelles questions utiliser ?
### R:
- Qu'est-ce qui vous prend le plus de temps aujourd'hui ?
- Où est-ce que l'équipe perd le plus d'énergie ?
- Qu'est-ce qui crée des erreurs ou des retards ?
- Si ce point disparaissait, qu'est-ce qui changerait ?

## Q: Que fait une bonne question ?
### R:
- Elle ouvre la discussion.
- Elle révèle le vrai besoin.
- Elle évite de vendre trop tôt.`,
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
              <Sparkles size={12} /> Guides d'alignement
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">Guides & savoir-faire</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Des repères simples pour que toute l'équipe travaille dans la même direction, avec clarté et confiance.
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
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Repères d'équipe</p>
                <h2 className="mt-1 text-lg font-semibold text-white">{filteredArticles.length} articles</h2>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un guide, une méthode..."
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
                Ces guides aident chacun à comprendre la vision, à adopter les bons réflexes et à garder une manière de travailler cohérente.
                Le but n'est pas de parler technique, mais de rendre le projet clair pour tous.
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
