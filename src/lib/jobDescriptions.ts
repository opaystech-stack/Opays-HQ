export type JobSection = {
  title: string;
  bullets: string[];
};

export type JobDescription = {
  slug: string;
  reference: string;
  title: string;
  holder: string;
  role: string;
  type: 'ASSOCIATE';
  summary: string;
  presentation: string;
  sections: JobSection[];
  kpis: string[];
  evolution: string[];
  conclusion: string;
};

export const jobDescriptions: JobDescription[] = [
  {
    slug: 'directeur-general',
    reference: 'OP-CEO-001',
    title: 'Directeur Général (CEO)',
    holder: 'Fenelon Lamsasiri',
    role: 'Vision & Stratégie',
    type: 'ASSOCIATE',
    summary:
      "Garant de la vision, de la cohérence stratégique et de la capacité du{2019}Opays à transformer lu{2019}IA en levier concret de performance pour ses clients.",
    presentation:
      "Le Directeur Général est le pilier de lu{2019}entreprise. Il ne se contente pas de décider : il su{2019}assure que chaque décision mène quelque part de concret. Il relie la vision à lu{2019}exécution, la stratégie à la réalité du terrain. Son travail quotidien consiste à garder lu{2019}entreprise lisible, solide et orientée résultat. Il supervise la R&D pour garantir que chaque innovation réponde à un vrai besoin client. Ce nu{2019}est pas un rôle théorique — cu{2019}est le garant que la promesse du{2019}Opays reste crédible et réaliste.",
    sections: [
      {
        title: 'Direction stratégique et vision',
        bullets: [
          'Définir les grandes orientations de lu{2019}entreprise à court terme (trimestre) et moyen terme (année).',
          'Arbitrer les priorités lorsquu{2019}il faut choisir entre vitesse, qualité et opportunité — sans sacrifier la crédibilité.',
          'Identifier les relais de croissance réalistes : quels clients, quels secteurs, quels partenaires.',
          'Maintenir la ligne directrice : simplicité, souveraineté, valeur client et exécution concrète.',
          'Protéger lu{2019}entreprise des distractions : dire non aux projets qui ne servent pas la mission.',
        ],
      },
      {
        title: 'Gouvernance et structuration',
        bullets: [
          'Su{2019}assurer que chaque associé connaît exactement son périmètre, ses responsabilités et ses limites.',
          'Valider les documents internes importants : contrats types, cadres opérationnels, processus de décision.',
          'Garantir que la structure de lu{2019}entreprise reste professionnelle, traçable et durable.',
          'Mettre en place les rituels de gouvernance : réunion hebdomadaire, point mensuel, revue trimestrielle.',
          'Arbitrer les conflits internes avec équité, en se basant sur les faits et les objectifs communs.',
        ],
      },
      {
        title: 'Coordination de lu{2019}équipe',
        bullets: [
          'Coordonner les 5 associés autour des priorités communes, en évitant les doublons et la dispersion.',
          'Animer les réunions de suivi avec un format simple : ce qui avance, ce qui bloque, ce quu{2019}on décide.',
          'Maintenir un rythme de travail régulier : chaque semaine a un début, un milieu et un bilan.',
          'Donner du feedback direct et constructif — ne pas attendre que les problèmes su{2019}accumulent.',
          'Protéger la culture du{2019}entreprise : transparence, rigueur, respect du travail et orientation client.',
        ],
      },
      {
        title: 'Pilotage R&D et innovation',
        bullets: [
          'Superviser les projets de recherche en su{2019}assurant quu{2019}ils mènent à un usage concret.',
          'Tester les nouvelles technologies et méthodes avant de les intégrer dans lu{2019}offre client.',
          'Maintenir une veille stratégique sur lu{2019}IA, lu{2019}automatisation et les outils souverains.',
          'Documenter les apprentissages et les partager avec lu{2019}équipe dans la base de connaissance.',
        ],
      },
      {
        title: 'Représentation et développement externe',
        bullets: [
          'Porter la vision du{2019}Opays auprès des partenaires, clients, institutions et communautés tech.',
          'Soutenir la crédibilité de lu{2019}entreprise dans les échanges clés : pitch, événements, rencontres stratégiques.',
          'Construire un réseau de confiance qui sert la croissance à long terme.',
          'Représenter lu{2019}entreprise avec un discours simple, honnête et aligné sur les actes.',
        ],
      },
    ],
    kpis: [
      'Avancement de la roadmap stratégique (% des jalons atteints par trimestre)',
      'Rentabilité globale : marge nette et discipline financière mensuelle',
      'Niveau du{2019}alignement de lu{2019}équipe : pas de tâche orpheline, pas de confusion sur les priorités',
      'Qualité des partenariats : nombre de relations actives qui génèrent de la valeur',
      'Temps de réponse aux décisions critiques : pas plus de 48h pour un arbitrage urgent',
    ],
    evolution: [
      'Pilotage du{2019}une équipe plus large à mesure de la croissance (10+ personnes).',
      'Renforcement de la représentation auprès des institutions et des acteurs économiques.',
      'Supervision de nouvelles lignes du{2019}activité ou de filiales spécialisées.',
      'Construction du{2019}un conseil consultatif pour accompagner la stratégie de long terme.',
    ],
    conclusion:
      "Ce poste doit garder Opays simple à comprendre, fort à lu{2019}extérieur et solide à lu{2019}intérieur. Le DG nu{2019}est pas celui qui parle le plus — cu{2019}est celui qui su{2019}assure que chaque effort de lu{2019}équipe mène à un résultat visible pour le client et durable pour lu{2019}entreprise.",
  },
  {
    slug: 'directeur-technique',
    reference: 'JD-OPAYS-002',
    title: 'Directeur Technique',
    holder: 'Evans SELEMANI',
    role: 'CTO',
    type: 'ASSOCIATE',
    summary:
      "Responsable de la qualité technique, de la stabilité des systèmes et de la livraison propre des solutions clients.",
    presentation:
      "Le Directeur Technique est celui qui transforme les besoins du client en systèmes qui marchent — et qui continuent de marcher. Il ne code pas pour le plaisir, il construit pour résoudre un problème réel. Son travail quotidien : su{2019}assurer que chaque solution livrée est fiable, sûre, maintenable et que le client peut la comprendre. La technologie nu{2019}est pas une fin en soi, cu{2019}est un moyen au service de la mission de lu{2019}entreprise.",
    sections: [
      {
        title: 'Développement et architecture',
        bullets: [
          'Concevoir des solutions robustes et adaptées au besoin réel du client, pas au besoin imaginé.',
          'Maintenir une architecture lisible : si un nouveau développeur ne comprend pas le code en 30 minutes, cu{2019}est trop compliqué.',
          'Réduire la dette technique de façon continue — ne pas accumuler de raccourcis dangereux.',
          'Choisir les technologies sur la base de critères simples : stabilité, communauté active, coût réel.',
          'Documenter chaque décision technique importante et son contexte.',
        ],
      },
      {
        title: 'Infrastructure et sécurité',
        bullets: [
          'Surveiller la disponibilité des services : si un client ne peut pas accéder à son outil, cu{2019}est une urgence.',
          'Protéger les accès, les données et les flux sensibles avec des pratiques standards (RLS, chiffrement, rotation des clés).',
          'Contribuer à la souveraineté technique : favoriser les solutions que lu{2019}entreprise maîtrise et peut contrôler.',
          'Mettre en place des sauvegardes automatiques et des procédures de récupération testées.',
          'Maintenir un inventaire à jour des accès, des services et des dépendances critiques.',
        ],
      },
      {
        title: 'Qualité et livraison',
        bullets: [
          'Valider le niveau de qualité avant chaque livraison : pas de déploiement sans test.',
          'Respecter la Definition of Done de chaque projet — si ce nu{2019}est pas terminé, ce nu{2019}est pas livré.',
          'Tester, corriger et documenter chaque changement important dans un journal clair.',
          'Livrer à lu{2019}heure ou prévenir à lu{2019}avance — ne jamais laisser le client dans le flou.',
          'Faire une revue post-livraison : quu{2019}est-ce qui a bien fonctionné, quu{2019}est-ce qui doit être amélioré.',
        ],
      },
      {
        title: 'Support R&D et innovation',
        bullets: [
          'Travailler avec le DG sur les besoins de recherche : quels outils, quelles méthodes, quelles intégrations.',
          'Transformer les idées en prototypes testables dans un délai raisonnable.',
          'Évaluer les nouvelles technologies sans se laisser distraire par les effets de mode.',
          'Partager les résultats de la R&D avec lu{2019}équipe pour que chacun comprenne ce qui change.',
        ],
      },
    ],
    kpis: [
      'Respect des délais techniques : % des livraisons à lu{2019}heure',
      'Temps moyen de correction des bugs critiques (objectif : moins de 24h)',
      'Disponibilité et stabilité des services (objectif : 99.5% uptime)',
      'Qualité de la documentation : chaque projet livré a un README à jour',
      'Satisfaction client sur les livrables techniques (retour direct ou indirect)',
    ],
    evolution: [
      'Pilotage de projets plus complexes et de plus grande envergure.',
      'Encadrement du{2019}un futur pôle technique (développeurs, DevOps, QA).',
      'Renforcement du rôle du{2019}architecte principal et de référent technique de lu{2019}entreprise.',
      'Contribution aux publications techniques et à la visibilité de lu{2019}expertise Opays.',
    ],
    conclusion:
      "Ce poste protège la promesse du{2019}Opays : livrer des solutions utiles, propres et durables. La vitesse nu{2019}a de valeur que si elle reste fiable. Le CTO nu{2019}est pas le développeur le plus rapide — cu{2019}est celui qui garantit que tout ce qui sort est solide.",
  },
  {
    slug: 'chef-commercial',
    reference: 'JD-OPAYS-003',
    title: 'Chef Commercial',
    holder: 'Prince BAGHENI',
    role: 'SALES',
    type: 'ASSOCIATE',
    summary:
      "Responsable du rythme commercial terrain, de la coordination des actions de vente et de la conversion des opportunités en projets signés.",
    presentation:
      "Le Chef Commercial est le métronome du terrain. Il ne vend pas — il crée les conditions pour que la vente arrive naturellement. Son travail : comprendre le client, formuler une proposition claire, suivre lu{2019}avancement et transformer lu{2019}intérêt en engagement signé. Il coordonne les sales, structure le pipeline et su{2019}assure que ce qui est vendu reste réaliste à livrer. Le bon commercial ne parle pas plus fort, il parle plus juste.",
    sections: [
      {
        title: 'Coordination commerciale',
        bullets: [
          'Planifier les descentes terrain chaque semaine : qui va où, avec quel objectif précis.',
          'Orchestrer les échanges entre les sales et lu{2019}équipe technique avant chaque proposition.',
          'Maintenir une vision claire et à jour du pipeline : combien de leads, à quel stade, quel potentiel.',
          'Former les commerciaux aux bons réflexes : écouter avant de proposer, qualifier avant de promettre.',
          'Organiser un point commercial hebdomadaire pour aligner lu{2019}équipe sur les priorités.',
        ],
      },
      {
        title: 'Relation client et closing',
        bullets: [
          'Conduire les échanges de découverte : poser les bonnes questions, écouter les vrais besoins.',
          'Clarifier le besoin du client dans un langage simple, sans jargon technique.',
          'Formuler une proposition de valeur convaincante basée sur des résultats concrets.',
          'Faire avancer la décision du client étape par étape, sans forcer ni précipiter.',
          'Gérer les objections avec honnêteté : si on ne peut pas, on le dit et on propose une alternative.',
        ],
      },
      {
        title: 'Suivi du pipeline et reporting',
        bullets: [
          'Suivre chaque opportunité par étape : premier contact → qualification → proposition → décision → signature.',
          'Repérer les blocages avant quu{2019}ils ne deviennent des impasses.',
          'Partager une lecture simple de la performance commerciale : ce qui avance, ce qui stagne, ce qui est perdu.',
          'Documenter chaque interaction client importante dans le CRM.',
          'Identifier les raisons des échecs pour améliorer le processus.',
        ],
      },
      {
        title: 'Lien avec lu{2019}exécution',
        bullets: [
          'Su{2019}assurer que chaque promesse commerciale est validée par lu{2019}équipe technique avant du{2019}être faite.',
          'Garder un lien direct entre ce qui est vendu et ce que lu{2019}entreprise peut réellement livrer.',
          'Participer au briefing de lancement de chaque nouveau projet pour transmettre le contexte client.',
          'Suivre la satisfaction client après la livraison et détecter les opportunités de renouvellement.',
        ],
      },
    ],
    kpis: [
      'Taux de conversion lead → projet signé (objectif : 25%+)',
      'Valeur du pipeline actif en dollars',
      'Nombre de descentes terrain qualifiées par semaine (objectif : 5+)',
      'Délai moyen entre premier contact et signature (objectif : < 45 jours)',
      'Taux de satisfaction client après livraison',
    ],
    evolution: [
      'Prise en charge du{2019}un portefeuille client plus large et diversifié.',
      'Construction du{2019}un système de vente prévisible avec des processus documentés.',
      'Formation et encadrement de nouveaux commerciaux.',
      'Contribution à la stratégie de pricing et de positionnement.',
    ],
    conclusion:
      "Le Chef Commercial doit aider Opays à vendre avec clarté, sans forcer, en montrant de la valeur réelle. Un bon deal nu{2019}est pas celui qui rapporte vite — cu{2019}est celui qui crée une relation durable avec un client satisfait.",
  },
  {
    slug: 'sales-gestion-comptable',
    reference: 'JD-OPAYS-004',
    title: 'Sales & Gestion Comptable',
    holder: 'Patricia ZAMWANA',
    role: 'SALES',
    type: 'ASSOCIATE',
    summary:
      "Responsable de la prospection terrain, de la collecte des besoins et de la rigueur comptable qui garde lu{2019}entreprise lisible et financièrement saine.",
    presentation:
      "Ce poste est le lien entre le terrain et la discipline financière. Patricia est celle qui écoute les entreprises, comprend leurs blocages, nourrit le pipeline commercial, et en même temps, garde une trésorerie claire et traçable. Cu{2019}est un double rôle exigeant : être à la fois sur le terrain pour identifier les opportunités et derrière le bureau pour su{2019}assurer que chaque dollar est compté, chaque facture suivie, chaque mouvement justifié.",
    sections: [
      {
        title: 'Prospection terrain',
        bullets: [
          'Identifier les entreprises à contacter : secteur, taille, signaux de besoin.',
          'Préparer chaque visite avec un objectif précis et une liste de questions clés.',
          'Observer les blocages réels chez le client avant de proposer quoi que ce soit.',
          'Transformer les rencontres en leads qualifiés avec des informations exploitables.',
          'Tenir un journal de prospection à jour : qui a été vu, quel résultat, quelle suite.',
        ],
      },
      {
        title: 'Audit de besoin et qualification',
        bullets: [
          'Collecter les informations de terrain de façon simple, structurée et réutilisable.',
          'Distinguer les besoins urgents des besoins importants — prioriser avec le Chef Commercial.',
          'Partager les éléments utiles à lu{2019}équipe technique pour préparer des propositions réalistes.',
          'Faire remonter les besoins concrets (pas les impressions) avec des données exploitables.',
        ],
      },
      {
        title: 'Gestion comptable et administrative',
        bullets: [
          'Saisir chaque mouvement de trésorerie avec régularité : entrées, sorties, justificatifs.',
          'Suivre les factures émises, les paiements reçus et les relances nécessaires.',
          'Classer les documents financiers de façon ordonnée et accessible.',
          'Préparer les éléments nécessaires pour les rapports financiers mensuels.',
          'Signaler immédiatement toute anomalie ou incohérence dans les chiffres.',
        ],
      },
      {
        title: 'Fiabilité des données',
        bullets: [
          'Garder des informations propres, cohérentes et à jour dans tous les outils (CRM, trésorerie, HQ).',
          'Aider lu{2019}équipe à garder une lecture simple de la réalité financière de lu{2019}entreprise.',
          'Participer à lu{2019}amélioration continue des processus administratifs.',
        ],
      },
    ],
    kpis: [
      'Nombre de leads qualifiés par semaine (objectif : 3+)',
      'Exactitude des journaux de trésorerie : 0 erreur sur les 30 derniers jours',
      'Délai de recouvrement des factures (objectif : < 30 jours)',
      'Qualité de la collecte terrain : informations exploitables et complètes',
      'Régularité de la mise à jour comptable (saisie quotidienne ou bihebdomadaire)',
    ],
    evolution: [
      'Prise en charge complète du recouvrement et de la gestion des créances.',
      'Élargissement du rôle administratif : contrats, assurances, conformité.',
      'Renforcement de la fonction de contrôle et de lisibilité financière.',
      'Formation à des outils comptables plus avancés pour accompagner la croissance.',
    ],
    conclusion:
      "Ce poste protège la rigueur de lu{2019}entreprise. Patricia aide Opays à rester propre dans ses chiffres, précis dans son suivi et sérieux dans sa relation client. Sans cette discipline, aucune croissance ne tient.",
  },
  {
    slug: 'sales-communication',
    reference: 'JD-OPAYS-005',
    title: 'Sales & Communication',
    holder: 'ZAINA BWALE GODLOVE',
    role: 'SALES',
    type: 'ASSOCIATE',
    summary:
      "Responsable de la prospection orientée image, de la qualité des supports de vente et de la traduction du travail du{2019}Opays en message clair, crédible et attractif.",
    presentation:
      "Zaina donne une forme visible à la valeur du{2019}Opays. Elle transforme la technique en récit compréhensible, les résultats en contenu utile et la présence de lu{2019}entreprise en signal de confiance. Son rôle est double : aller sur le terrain pour identifier les prospects et créer les supports qui donnent envie du{2019}en savoir plus. Un bon message ne vend pas — il ouvre la porte. Cu{2019}est ensuite la qualité du service qui fait le reste.",
    sections: [
      {
        title: 'Prospection et rayonnement',
        bullets: [
          'Identifier les entreprises et les personnes à cibler en lien avec le Chef Commercial.',
          'Faire émerger les besoins réels et les points de friction lors des premiers échanges.',
          'Créer des points de contact utiles avec les prospects : messages, relances, contenus personnalisés.',
          'Représenter Opays dans les événements, salons et rencontres professionnelles.',
          'Maintenir un réseau de contacts actifs et qualifiés.',
        ],
      },
      {
        title: 'Branding et supports de vente',
        bullets: [
          'Créer ou relire les plaquettes, visuels, présentations et supports de vente.',
          'Garder une cohérence forte entre le fond (message), le ton (professionnel mais accessible) et la forme (design propre).',
          'Su{2019}assurer que chaque support donne envie de lire, de comprendre et du{2019}agir.',
          'Adapter les supports selon le public cible : dirigeant, responsable IT, équipe opérationnelle.',
          'Maintenir une bibliothèque de supports à jour et facilement accessible à lu{2019}équipe.',
        ],
      },
      {
        title: 'Communication externe',
        bullets: [
          'Valoriser la présence du{2019}Opays sur LinkedIn, les réseaux sociaux et les espaces professionnels.',
          'Publier régulièrement du contenu qui montre lu{2019}expertise sans être prétentieux.',
          'Rendre lu{2019}entreprise lisible pour les dirigeants et les partenaires en 30 secondes.',
          'Transformer les résultats concrets en posts, articles ou témoignages.',
          'Surveiller lu{2019}image de marque et signaler tout message qui ne correspond pas à nos valeurs.',
        ],
      },
      {
        title: 'Storytelling et preuve sociale',
        bullets: [
          'Traduire les succès techniques en études de cas simples et convaincantes.',
          'Rendre la valeur du{2019}Opays visible sans jargon inutile — un dirigeant non technique doit comprendre.',
          'Collecter les témoignages clients et les transformer en contenu réutilisable.',
          'Construire progressivement une bibliothèque de preuves : résultats, avant/après, gains mesurés.',
        ],
      },
    ],
    kpis: [
      'Nombre de leads qualifiés générés par les actions de communication (objectif : 2/semaine)',
      'Qualité et cohérence des supports produits : relecture validée avant publication',
      'Engagement sur les contenus publiés : likes, commentaires, partages, messages entrants',
      'Nombre de supports de vente à jour et disponibles pour lu{2019}équipe',
      'Clarté du message de marque : un nouveau contact comprend ce quu{2019}on fait en une phrase',
    ],
    evolution: [
      'Construction du{2019}une ligne éditoriale structurée avec calendrier de publication.',
      'Déploiement de supports de vente multicanaux (vidéo, podcast, newsletter).',
      'Renforcement du rôle du{2019}ambassadrice de la marque auprès des partenaires.',
      'Contribution à la stratégie de marque employeur pour attirer les futurs talents.',
    ],
    conclusion:
      "Ce poste doit donner envie de faire confiance à Opays avant même la première réunion. Le bon message est simple, net et mémorable. Zaina est celle qui transforme le travail invisible de lu{2019}équipe en signal visible de crédibilité.",
  },
];

export function getJobDescription(slug: string) {
  return jobDescriptions.find((item) => item.slug === slug);
}

export function jobDescriptionToMarkdown(job: JobDescription) {
  const sections = job.sections
    .map(
      (section) => `## ${section.title}
${section.bullets.map((bullet) => `- ${bullet}`).join('\n')}`
    )
    .join('\n\n');

  const kpis = job.kpis.map((item) => `- ${item}`).join('\n');
  const evolution = job.evolution.map((item) => `- ${item}`).join('\n');

  return `# FICHE DE POSTE — OPAYS TECH

**Intitulé du poste :** ${job.title}
**Titulaire :** ${job.holder}
**Rôle HQ :** ${job.role}
**Type :** ${job.type}
**Référence :** ${job.reference}

## 1. PRÉSENTATION DU POSTE
${job.presentation}

## 2. RESPONSABILITÉS PRINCIPALES
${sections}

## 3. INDICATEURS DE PERFORMANCE (KPI)
${kpis}

## 4. ÉVOLUTION DU POSTE
${evolution}

## 5. CONCLUSION
${job.conclusion}
`;
}
