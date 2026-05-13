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
  Book,
  Zap,
  Info
} from 'lucide-react';
import NewKnowledgeModal from '@/components/modals/NewKnowledgeModal';
import DocumentReaderModal from '@/components/DocumentReaderModal';

const IconMap: Record<string, React.ReactNode> = {
  METHOD: <Target className="text-cyan-600" size={22} />,
  GUIDE: <GraduationCap className="text-emerald-600" size={22} />,
  VISION: <Lightbulb className="text-amber-600" size={22} />,
  TECH: <BookOpen className="text-violet-600" size={22} />,
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
    content: `# Q: Qu’est-ce qu’une entreprise AI-Native ?
### R:
- Une entreprise AI-Native utilise l’IA comme un réflexe de travail quotidien, pas comme un gadget ou un argument marketing.
- Concrètement, cela veut dire que chaque membre de l’équipe sait quand et comment utiliser l’IA pour gagner du temps.
- L’IA n’est pas un département à part — elle est intégrée dans la façon de travailler de chacun.

## Q: En quoi cela change notre manière de travailler ?
### R:
- Les décisions deviennent plus rapides parce qu’on a accès à des analyses en temps réel.
- Les tâches répétitives (rédaction, tri, recherche) prennent 3x moins de temps.
- L’équipe se concentre sur ce qui crée de la valeur : la relation client, la qualité, la créativité.
- Chaque document, chaque rapport, chaque email peut être préparé avec un assistant IA puis validé par un humain.

## Q: Quels sont les exemples concrets au quotidien ?
### R:
- **Commercial** : l’IA aide à préparer un email de prospection adapté au secteur du client.
- **Technique** : l’IA génère une première version de documentation ou détecte des erreurs dans le code.
- **Communication** : l’IA propose un brouillon de post LinkedIn que le rédacteur affine.
- **Direction** : l’IA synthétise les données d’activité pour un point hebdomadaire en 2 minutes.

## Q: Qu’est-ce qu’on refuse de copier des autres ?
### R:
- Les promesses floues du type "l’IA fait tout toute seule".
- Les méthodes trop compliquées qui démotivent l’équipe.
- Les outils qui envoient nos données sensibles à des tiers sans contrôle.
- L’idée que l’IA remplace les gens — chez nous, elle les renforce.

## Q: Quelle est la règle d’or ?
### R:
- L’IA propose, l’humain décide. Toujours.
- Si le résultat n’est pas bon, on corrige et on améliore la demande.
- On ne publie jamais un contenu généré par l’IA sans l’avoir relu et validé.`,
  },
  {
    id: 'featured-ai-helpers',
    title: 'Comment utiliser l’IA sans être technique',
    category: 'METHOD',
    target_role: 'ALL',
    created_at: new Date().toISOString(),
    content: `# Q: Faut-il savoir coder pour utiliser l’IA chez Opays ?
### R:
- Non. Il faut surtout savoir expliquer un besoin clairement.
- L’IA est un assistant : elle fait ce qu’on lui demande, mais elle a besoin d’instructions précises.
- Plus ta demande est claire, meilleur sera le résultat.

## Q: À quoi peut m’aider l’IA au quotidien ?
### R:
- **Résumé un texte long** en 5 points clés.
- **Rédiger un premier brouillon** d’email, de rapport ou de post.
- **Préparer une réponse client** adaptée au contexte.
- **Organiser des idées** en plan structuré.
- **Corriger et améliorer** un texte existant (ton, clarté, fautes).
- **Traduire** un document ou adapter un contenu pour un autre public.

## Q: Comment bien formuler ma demande ?
### R:
- Dire **ce qu’on veut obtenir** : \"Je veux un email de relance pour un prospect qui n’a pas répondu depuis 5 jours.\"
- Préciser **pour qui** : \"Le ton doit être professionnel mais chaleureux.\"
- Donner **un exemple** si possible.
- Indiquer **le format** : \"En 3 paragraphes maximum\" ou \"Sous forme de liste.\"

## Q: Qu’est-ce qu’il faut éviter ?
### R:
- Les demandes vagues : \"Écris-moi quelque chose de bien\" → trop flou.
- Les instructions contradictoires : \"Sois bref mais très détaillé.\"
- Laisser l’IA décider seule sur des sujets sensibles.
- Copier-coller sans relire — l’IA peut se tromper.

## Q: Comment savoir si le résultat est bon ?
### R:
- Le message est clair et compréhensible par le destinataire.
- Le ton correspond à l’image d’Opays : professionnel, simple, honnête.
- Les informations factuelles sont vérifiées.
- Tu serais à l’aise de signer ce texte avec ton nom.`,
  },
  {
    id: 'featured-operations',
    title: 'Notre rythme de travail hebdomadaire',
    category: 'GUIDE',
    target_role: 'ALL',
    created_at: new Date().toISOString(),
    content: `# Q: Pourquoi un rythme commun est essentiel ?
### R:
- Parce qu’une petite équipe de 5 personnes ne peut pas se permettre la confusion.
- Le rythme commun évite les doublons, les oublis et la dispersion.
- Quand chacun sait ce qui se passe, la confiance et la vitesse augmentent.

## Q: Comment organiser une semaine chez Opays ?
### R:
1. **Lundi matin** — Point de cadrage (15 min) : chacun dit sa priorité de la semaine et ses blocages.
2. **Mardi à jeudi** — Exécution : chacun avance sur ses tâches, communique si un blocage apparaît.
3. **Mercredi** — Check rapide asynchrone : un message dans le canal équipe pour dire où on en est.
4. **Vendredi après-midi** — Bilan de semaine (15 min) : ce qui est terminé, ce qui passe à la semaine suivante.

## Q: Quelles règles simples suivre ?
### R:
- Une seule priorité par personne par semaine — pas 5.
- Si tu es bloqué, dis-le dans les 24h, pas vendredi.
- Chaque tâche terminée est mise à jour dans HQ.
- On ne commence pas une nouvelle tâche avant d’avoir fini la précédente.

## Q: Pourquoi ce rythme fonctionne ?
### R:
- Chacun connaît le cap et ses responsabilités.
- Les retards se détectent tôt, avant qu’ils deviennent des problèmes.
- On garde de la place pour réagir aux urgences.
- L’équipe avance ensemble, pas chacun dans son coin.`,
  },
  {
    id: 'featured-client-trust',
    title: 'Comment servir le client avec confiance',
    category: 'GUIDE',
    target_role: 'ALL',
    created_at: new Date().toISOString(),
    content: `# Q: Qu’est-ce qui compte le plus dans notre relation client ?
### R:
- **La clarté** : le client doit comprendre ce qu’on fait, pourquoi, et quand ce sera prêt.
- **La fiabilité** : quand on dit \"vendredi\", c’est vendredi. Pas lundi.
- **La rapidité de réponse** : répondre dans les 24h, même si c’est pour dire \"je reviens vers vous demain\".
- **Le respect de la parole donnée** : ne jamais promettre ce qu’on ne peut pas livrer.

## Q: Que doit faire chaque membre de l’équipe ?
### R:
- Répondre proprement et dans les délais.
- Prévenir immédiatement quand il y a un blocage ou un retard.
- Dire la vérité plutôt que promettre trop vite pour faire plaisir.
- Garder le client informé même quand il n’y a pas de nouveau : \"Nous avançons, voici où nous en sommes.\"
- Ne jamais ignorer un message client, même si la réponse nécessite du temps.

## Q: Que faire quand un client est mécontent ?
### R:
- Écouter sans interrompre ni se justifier immédiatement.
- Reformuler le problème pour montrer qu’on a compris.
- Proposer une solution concrète avec un délai.
- Faire un suivi après la résolution pour confirmer que tout est ok.

## Q: Pourquoi c’est important ?
### R:
- La confiance se construit sur les petits gestes répétés, pas sur les grands discours.
- Un client satisfait en ramène d’autres. Un client déçu en éloigne 10.
- La qualité du service est notre meilleur argument commercial.`,
  },
  {
    id: 'featured-data-safety',
    title: 'Protéger les informations de l’entreprise',
    category: 'TECH',
    target_role: 'ALL',
    created_at: new Date().toISOString(),
    content: `# Q: Pourquoi la confidentialité est essentielle ?
### R:
- Nos informations internes (clients, finances, stratégie) ont une vraie valeur.
- Un manque de discrétion peut coûter un client, une opportunité ou la réputation de l’entreprise.
- Protéger les données, c’est protéger l’équipe et les clients.

## Q: Qu’est-ce qu’on ne partage jamais sans autorisation ?
### R:
- **Données clients** : noms, contacts, projets en cours, chiffres.
- **Informations financières** : trésorerie, budgets, marges, salaires.
- **Accès techniques** : mots de passe, clés API, accès serveurs.
- **Documents stratégiques** : plans commerciaux, pipeline, roadmap.

## Q: Quels sont les bons réflexes ?
### R:
- Si tu n’es pas sûr de pouvoir partager une info, demande au responsable avant.
- Ne jamais envoyer de données sensibles par messagerie non sécurisée.
- Si un accès ne te sert plus, signale-le pour qu’il soit révoqué.
- Ne pas stocker de mots de passe dans des fichiers texte ou des notes.
- Verrouiller ton poste quand tu t’absentes, même 5 minutes.

## Q: Que faire en cas de doute ou d’incident ?
### R:
- Prévenir immédiatement le CTO ou le DG.
- Ne pas essayer de réparer seul un problème de sécurité.
- Documenter ce qui s’est passé : quand, quoi, comment.
- Mieux vaut une fausse alerte qu’un vrai problème non signalé.`,
  },
  {
    id: 'featured-roles',
    title: 'Bien travailler ensemble dans une petite équipe',
    category: 'METHOD',
    target_role: 'ALL',
    created_at: new Date().toISOString(),
    content: `# Q: Pourquoi les rôles doivent être clairs ?
### R:
- Parce que dans une équipe de 5 personnes, chaque flou crée un blocage.
- Quand tout le monde sait ce qu’il doit faire, l’équipe avance 2x plus vite.
- La clarté des rôles évite les conflits et la duplication d’effort.

## Q: Qu’est-ce que chacun doit comprendre ?
### R:
- **Son rôle précis** : ce qu’on attend de lui chaque semaine.
- **Son niveau de responsabilité** : ce qu’il peut décider seul et ce qui nécessite une validation.
- **À qui demander de l’aide** : pour chaque type de problème, il y a un interlocuteur principal.
- **Quand prévenir l’équipe** : tout retard, tout blocage, toute décision importante.

## Q: Quelles règles de communication suivre ?
### R:
- Répondre aux messages de l’équipe dans les 4 heures en journée de travail.
- Utiliser les canaux dédiés : pas de discussion projet dans les messages privés.
- Être direct et factuel : \"J’ai terminé\" ou \"Je suis bloqué sur X, j’ai besoin de Y.\" 
- Éviter les longs messages quand un appel de 2 minutes règle le problème.

## Q: Quelle attitude aide vraiment ?
### R:
- **Être fiable** : faire ce qu’on dit, quand on le dit.
- **Être simple** : pas de politique, pas de jeux. On parle franchement.
- **Être réactif** : ne pas laisser traîner les sujets importants.
- **Respecter le travail des autres** : critiquer les idées, jamais les personnes.
- **Demander de l’aide** quand on en a besoin — ce n’est pas une faiblesse.`,
  },
  {
    id: 'featured-adaptation',
    title: 'Ce qu’on apprend des autres sans se perdre',
    category: 'VISION',
    target_role: 'ALL',
    created_at: new Date().toISOString(),
    content: `# Q: Peut-on s’inspirer d’autres entreprises ?
### R:
- Oui, c’est même essentiel pour ne pas réinventer la roue.
- Mais attention : on s’inspire d’une méthode ou d’une rigueur, jamais d’une identité superficielle.
- Une bonne idée ailleurs ne devient utile que si elle est adaptée à notre réalité locale et à nos valeurs.

## Q: Qu’est-ce qu’on retient d’une inspiration extérieure ?
### R:
- **La discipline d’exécution** : comment ils tiennent leurs délais et leurs promesses.
- **La clarté du message** : comment ils expliquent des choses complexes simplement.
- **L’obsession du client** : comment chaque détail est pensé pour l’utilisateur final.
- **La vitesse de test** : comment ils échouent vite pour apprendre plus vite.

## Q: Qu’est-ce qu’on adapte spécifiquement à Opays ?
### R:
- **Notre souveraineté** : nous privilégions les solutions que nous maîtrisons.
- **Notre culture commando** : nous sommes une petite équipe agile, pas une bureaucratie.
- **Notre pragmatisme** : si une méthode \"moderne\" nous ralentit sans résultat concret, on la rejette.
- **Notre respect du contexte client** : nous n’imposons pas d’outils compliqués là où la simplicité suffit.

## Q: Quelle est la règle finale ?
### R:
- On garde ce qui nous rend plus forts, plus rapides et plus fiables.
- On laisse de côté ce qui ne nous ressemble pas ou ce qui complexifie inutilement notre travail.
- L’objectif n’est pas d’être une copie, mais d’être la meilleure version d’Opays Tech.`,
  },
  {
    id: 'featured-pitch',
    title: "Le pitch simple pour expliquer notre valeur",
    category: 'VISION',
    target_role: 'SALES',
    created_at: new Date().toISOString(),
    content: `# Q: Comment présenter Opays en une phrase ?
### R:
- \"Nous aidons les entreprises à supprimer les lourdeurs administratives et opérationnelles qui leur font perdre du temps, de l’énergie et de l’argent.\"

## Q: Comment expliquer le bénéfice sans jargon technique ?
### R:
- **Gain de temps** : ce qui prenait une journée prend désormais une heure.
- **Fiabilité** : nous réduisons les erreurs humaines liées à la saisie manuelle.
- **Réactivité** : vos clients reçoivent leurs réponses et leurs devis en quelques minutes.
- **Focus** : votre équipe peut enfin se concentrer sur son vrai métier, pas sur la paperasse.

## Q: Quelle image utiliser pour marquer les esprits ?
### R:
- \"Imaginez votre entreprise comme un coureur qui porte un sac à dos rempli de pierres inutiles. Notre rôle est d’enlever ces pierres une par une pour vous permettre de courir plus vite et plus loin.\"

## Q: Que faut-il éviter à tout prix ?
### R:
- Ne pas dire : \"Nous installons de l’IA.\" → Ça fait peur ou c’est trop flou.
- Ne pas promettre de miracles : \"Tout sera automatique demain.\" → C’est faux et dangereux.
- Ne pas oublier l’aspect humain : nos outils sont là pour aider les gens, pas pour les remplacer.`,
  },
];

function renderContent(content: string) {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (!listItems.length) return;
    nodes.push(
      <ul key={`${keyPrefix}-list-${nodes.length}`} className="space-y-3 my-4">
        {listItems.map((item, index) => (
          <li key={`${keyPrefix}-item-${index}`} className="flex gap-4 text-slate-600 font-medium leading-relaxed">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-600 shadow-[0_0_8px_rgba(8,145,178,0.3)]" />
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
        <h2 key={`h1-${index}`} className="text-2xl font-bold tracking-tight text-slate-900 uppercase mb-4 mt-8 first:mt-0">
          {trimmed.replace(/^#\s+/, '')}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList(`h2-${index}`);
      nodes.push(
        <h3 key={`h2-${index}`} className="text-xs font-black uppercase tracking-[0.22em] text-cyan-600 mb-3 mt-6">
          {trimmed.replace(/^##\s+/, '')}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList(`h3-${index}`);
      nodes.push(
        <h4 key={`h3-${index}`} className="text-sm font-bold text-slate-900 mb-2">
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
      <p key={`p-${index}`} className="leading-relaxed text-slate-600 font-medium mb-4">
        {trimmed}
      </p>
    );
  });

  flushList('end');
  return nodes;
}

export default function KnowledgePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [readerArticle, setReaderArticle] = useState<any>(null);
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

  const openReader = (article: any) => {
    setActiveArticleId(article.id);
    setReaderArticle(article);
    setReaderOpen(true);
  };

  return (
    <div className="relative min-h-full px-6 py-8 text-slate-900 lg:px-8 bg-[#f8f9fb]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />
      
      <div className="relative z-10 mx-auto max-w-[1600px] space-y-8">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-600">
              <Sparkles size={12} /> Guides d'alignement
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl uppercase">Guides & savoir-faire</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 font-medium">
                Des repères simples pour que toute l'équipe travaille dans la même direction, avec clarté et confiance.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Rechercher un guide..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-50/50 font-medium"
              />
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-black"
              >
                <Plus size={18} /> Nouveau Guide
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredArticles.map((article) => {
            const active = article.id === activeArticle?.id;
            return (
              <button
                key={article.id}
                onClick={() => openReader(article)}
                className={`group relative flex flex-col h-[340px] rounded-[2.5rem] border p-8 text-left transition-all ${
                  active
                    ? 'border-indigo-600 bg-white shadow-2xl shadow-indigo-600/10 ring-1 ring-indigo-600/10'
                    : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-600/5'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-2xl p-4 border transition-all ${active ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                      {IconMap[article.category] || <Book size={24} />}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`text-lg font-bold uppercase tracking-tight leading-tight line-clamp-1 ${active ? 'text-slate-900' : 'text-slate-700'}`}>{article.title}</h3>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                        {CategoryLabel[article.category] || article.category} • {article.target_role || 'ALL'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`mt-8 flex-1 overflow-hidden text-sm font-medium leading-relaxed ${active ? 'text-slate-600' : 'text-slate-500'}`}>
                  <p className="line-clamp-4">
                    {article.content.replace(/[#*`]/g, '').trim()}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-indigo-600' : 'text-slate-400'}`}>Consulter le guide</span>
                    <ArrowRight size={14} className={`transition-all ${active ? 'text-indigo-600 translate-x-1' : 'text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1'}`} />
                  </div>
                  <div className={`rounded-lg px-2 py-1 text-[8px] font-black uppercase tracking-tighter ${active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                    RAG Ready
                  </div>
                </div>
              </button>
            );
          })}

          {!loading && !filteredArticles.length && (
            <div className="col-span-full rounded-[3rem] border border-dashed border-slate-200 py-32 text-center bg-white/50">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-300 mb-6">
                <Info size={32} />
              </div>
              <p className="text-base font-bold text-slate-400 uppercase tracking-widest">Aucun guide ne correspond</p>
              <p className="mt-2 text-sm text-slate-400 font-medium">Affinez votre recherche ou créez un nouveau guide.</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h4 className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-4">Pourquoi ce centre ?</h4>
            <p className="text-sm font-medium leading-relaxed text-slate-600">Pour qu'une équipe de 5 personnes avance comme une seule entité, chaque geste, chaque décision doit être documentée et accessible.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h4 className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-4">Mise à jour</h4>
            <p className="text-sm font-medium leading-relaxed text-slate-600">Si vous apprenez quelque chose d'important en mission, créez un nouveau guide pour en faire profiter toute l'organisation.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h4 className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-4">Confidentialité</h4>
            <p className="text-sm font-medium leading-relaxed text-slate-600">Ces guides sont internes. Ils représentent notre avantage concurrentiel et notre méthode commando. Gardez-les précieusement.</p>
          </div>
        </div>

        <NewKnowledgeModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchData}
        />

        <DocumentReaderModal
          open={readerOpen}
          onClose={() => setReaderOpen(false)}
          title={readerArticle?.title || activeArticle?.title || 'Lecture'}
          subtitle="Lecture centrée pour mieux consulter le guide sans distraction."
          content={readerArticle?.content || activeArticle?.content}
          badge={CategoryLabel[readerArticle?.category || activeArticle?.category || ''] || 'Guide'}
          sourceLabel={readerArticle?.target_role || activeArticle?.target_role || 'ALL'}
        />
      </div>
    </div>
  );
}
