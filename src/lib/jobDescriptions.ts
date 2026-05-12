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
    reference: 'JD-OPAYS-001',
    title: 'Directeur Général & Lead R&D',
    holder: '[DG]',
    role: 'CEO',
    type: 'ASSOCIATE',
    summary:
      "Garant de la vision, de la cohérence stratégique et de la capacité d'Opays à transformer l'IA en levier concret de performance.",
    presentation:
      "Le Directeur Général pilote la direction globale d'Opays Tech. Il veille à la cohérence entre la vision, les offres, les partenariats, la R&D et la discipline d'exécution. Son rôle n'est pas seulement de décider, mais de garder l'entreprise lisible, solide et orientée résultat.",
    sections: [
      {
        title: 'Direction stratégique et vision',
        bullets: [
          'Définir les grandes orientations de l’entreprise en cohérence avec la vision Opays.',
          'Arbitrer les priorités lorsqu’il faut choisir entre vitesse, qualité et opportunité.',
          'Identifier les relais de croissance, les opportunités d’impact et les angles de différenciation.',
          'Maintenir la ligne directrice: simplicité, souveraineté, valeur client et exécution concrète.',
        ],
      },
      {
        title: 'Gouvernance et structuration',
        bullets: [
          'S’assurer que les rôles, les responsabilités et les processus de décision restent clairs.',
          'Valider les documents internes importants et les cadres opérationnels communs.',
          'Veiller à ce que la structure de l’entreprise reste professionnelle et durable.',
        ],
      },
      {
        title: 'Coordination de l’équipe',
        bullets: [
          'Coordonner les 5 associés autour des priorités communes.',
          'Animer les réunions de suivi, de cadrage et de validation.',
          'Maintenir un rythme de travail régulier et une culture de responsabilité.',
        ],
      },
      {
        title: 'Représentation et développement externe',
        bullets: [
          'Porter la vision d’Opays auprès des partenaires, clients, institutions et communautés.',
          'Soutenir la crédibilité de l’entreprise dans les échanges clés et les décisions structurantes.',
        ],
      },
    ],
    kpis: [
      'Avancement de la roadmap stratégique',
      'Rentabilité globale et discipline financière',
      'Niveau d’alignement de l’équipe sur les priorités',
      'Qualité des partenariats et de la crédibilité externe',
    ],
    evolution: [
      'Pilotage d’une équipe plus large à mesure de la croissance.',
      'Renforcement de la représentation nationale et institutionnelle.',
      'Supervision de nouveaux projets structurants ou de nouvelles lignes d’activité.',
    ],
    conclusion:
      "Ce poste doit garder Opays simple à comprendre, fort à l'extérieur et solide à l'intérieur. C'est la fonction qui veille à ce que l'ambition reste reliée à l'exécution.",
  },
  {
    slug: 'directeur-technique',
    reference: 'JD-OPAYS-002',
    title: 'Directeur Technique',
    holder: 'Evans',
    role: 'CTO',
    type: 'ASSOCIATE',
    summary:
      "Responsable de la qualité technique, de la stabilité des systèmes et de la livraison propre des solutions clients.",
    presentation:
      "Le Directeur Technique transforme les besoins du client en systèmes fiables, sûrs et maintenables. Il s'assure que la technologie sert réellement la mission de l'entreprise, sans complexifier inutilement le travail de l'équipe.",
    sections: [
      {
        title: 'Développement et architecture',
        bullets: [
          'Concevoir des solutions robustes et adaptées au besoin réel du client.',
          'Maintenir une architecture lisible, évolutive et facile à faire évoluer.',
          'Réduire la dette technique et anticiper les problèmes de stabilité.',
        ],
      },
      {
        title: 'Infrastructure et sécurité',
        bullets: [
          'Surveiller la disponibilité des services et la qualité de l’infrastructure.',
          'Protéger les accès, les données et les flux sensibles.',
          'Contribuer à la souveraineté technique de l’entreprise.',
        ],
      },
      {
        title: 'Qualité et livraison',
        bullets: [
          'Valider le niveau de qualité avant livraison.',
          'Tester, corriger et documenter chaque changement important.',
          'S’assurer que la Definition of Done est respectée.',
        ],
      },
      {
        title: 'Support R&D',
        bullets: [
          'Travailler avec le DG sur les besoins de recherche et d’innovation.',
          'Transformer les idées en prototypes utiles ou en solutions prêtes à l’emploi.',
        ],
      },
    ],
    kpis: [
      'Respect des délais techniques',
      'Temps moyen de correction des bugs',
      'Disponibilité et stabilité des services',
      'Qualité des livraisons et documentation associée',
    ],
    evolution: [
      'Pilotage de plus de projets ou de modules à mesure de la croissance.',
      'Encadrement d’un éventuel futur pôle technique plus large.',
      'Renforcement du rôle d’architecte principal de l’entreprise.',
    ],
    conclusion:
      "Ce poste protège la promesse d'Opays: livrer des solutions utiles, propres et durables. La vitesse n'a de valeur que si elle reste fiable.",
  },
  {
    slug: 'chef-commercial',
    reference: 'JD-OPAYS-003',
    title: 'Chef Commercial',
    holder: 'Prince',
    role: 'SALES',
    type: 'ASSOCIATE',
    summary:
      "Responsable du rythme commercial terrain, de la coordination des actions de vente et de la conversion des opportunités en projets signés.",
    presentation:
      "Le Chef Commercial donne le tempo du terrain. Il relie la prospection, l’audit de besoin, la proposition de valeur et la signature. Son rôle est de transformer l’intérêt du client en engagement clair et mesurable.",
    sections: [
      {
        title: 'Coordination commerciale',
        bullets: [
          'Planifier les descentes terrain et les priorités de prospection.',
          'Orchestrer les échanges entre les sales et l’équipe technique.',
          'Maintenir une vision claire du pipeline.',
        ],
      },
      {
        title: 'Relation client et closing',
        bullets: [
          'Conduire les échanges de découverte et de qualification.',
          'Clarifier le besoin du client et formuler une proposition convaincante.',
          'Faire avancer la décision jusqu’à la signature.',
        ],
      },
      {
        title: 'Suivi du pipeline',
        bullets: [
          'Suivre les opportunités par étape et par niveau de priorité.',
          'Repérer les blocages avant qu’ils ne ralentissent la vente.',
          'Partager une lecture simple de la performance commerciale.',
        ],
      },
      {
        title: 'Lien avec l’exécution',
        bullets: [
          'S’assurer que ce qui est vendu reste réaliste à livrer.',
          'Garder un lien direct entre promesse commerciale et capacité de production.',
        ],
      },
    ],
    kpis: [
      'Taux de conversion lead → projet',
      'Valeur du pipeline actif',
      'Nombre de descentes terrain utiles',
      'Clarté du suivi commercial et des priorités',
    ],
    evolution: [
      'Prise en charge d’un portefeuille plus large.',
      'Renforcement du rôle de pilotage commercial.',
      'Construction d’un système de vente plus structuré et plus prévisible.',
    ],
    conclusion:
      "Le Chef Commercial doit aider Opays à vendre avec clarté, sans forcer, en montrant de la valeur réelle. Le but n'est pas de parler plus fort, mais de parler plus juste.",
  },
  {
    slug: 'sales-gestion-comptable',
    reference: 'JD-OPAYS-004',
    title: 'Sales & Gestion Comptable',
    holder: 'Patricia',
    role: 'SALES',
    type: 'ASSOCIATE',
    summary:
      "Responsable de la prospection terrain, de la collecte des besoins et de la rigueur comptable qui garde l’entreprise lisible et saine.",
    presentation:
      "Ce poste relie le terrain à la discipline financière. Il permet d’écouter les entreprises, de comprendre leurs blocages, de nourrir le pipeline et de garder une trésorerie claire et suivie.",
    sections: [
      {
        title: 'Prospection terrain',
        bullets: [
          'Identifier les entreprises à contacter et préparer les visites.',
          'Observer les blocages réels chez le client avant de proposer une solution.',
          'Transformer les rencontres en leads utiles et qualifiés.',
        ],
      },
      {
        title: 'Audit de besoin',
        bullets: [
          'Collecter les informations de terrain de façon simple et ordonnée.',
          'Partager les éléments utiles au Chef Commercial et à l’équipe technique.',
          'Faire remonter les besoins concrets, pas seulement les impressions.',
        ],
      },
      {
        title: 'Gestion comptable et administrative',
        bullets: [
          'Saisir les mouvements de trésorerie avec régularité.',
          'Suivre les factures, les paiements et les relances.',
          'Classer les justificatifs et les documents utiles à la lecture financière.',
        ],
      },
      {
        title: 'Fiabilité des données',
        bullets: [
          'Garder des informations propres, cohérentes et à jour.',
          'Aider l’équipe à garder une lecture simple de la réalité financière.',
        ],
      },
    ],
    kpis: [
      'Nombre de leads qualifiés par semaine',
      'Exactitude des journaux de trésorerie',
      'Délai de recouvrement des factures',
      'Qualité de la collecte terrain et du suivi administratif',
    ],
    evolution: [
      'Prise en charge d’un suivi plus complet du recouvrement.',
      'Élargissement du rôle administratif au fur et à mesure de la structuration.',
      'Renforcement de la fonction de contrôle et de lisibilité financière.',
    ],
    conclusion:
      "Ce poste protège la rigueur de l'entreprise. Il aide Opays à rester propre dans ses chiffres, précis dans son suivi et sérieux dans sa relation client.",
  },
  {
    slug: 'sales-communication',
    reference: 'JD-OPAYS-005',
    title: 'Sales & Communication',
    holder: 'Zaina',
    role: 'SALES',
    type: 'ASSOCIATE',
    summary:
      "Responsable de la prospection orientée image, de la qualité des supports et de la traduction du travail d’Opays en message clair et attractif.",
    presentation:
      "Ce poste donne une forme visible à la valeur d’Opays. Il transforme la technique en récit compréhensible, les résultats en contenu utile et la présence de l’entreprise en signal de confiance.",
    sections: [
      {
        title: 'Prospection et rayonnement',
        bullets: [
          'Identifier les entreprises et les personnes à cibler.',
          'Faire émerger les besoins réels et les points de friction.',
          'Créer des points de contact utiles avec les prospects.',
        ],
      },
      {
        title: 'Branding et supports',
        bullets: [
          'Créer ou relire les plaquettes, visuels et supports de vente.',
          'Garder une cohérence forte entre le fond, le ton et la forme.',
          'S’assurer que chaque support donne envie de lire et de comprendre.',
        ],
      },
      {
        title: 'Communication externe',
        bullets: [
          'Valoriser la présence d’Opays sur les réseaux et dans les espaces publics.',
          'Rendre l’entreprise lisible pour les dirigeants et partenaires.',
          'Transformer les idées et les résultats en messages crédibles.',
        ],
      },
      {
        title: 'Storytelling et preuve',
        bullets: [
          'Traduire les succès techniques en études de cas simples.',
          'Rendre la valeur d’Opays visible sans jargon inutile.',
        ],
      },
    ],
    kpis: [
      'Nombre de leads qualifiés générés',
      'Qualité et cohérence des supports produits',
      'Engagement et portée des contenus',
      'Clarté du message de marque dans le temps',
    ],
    evolution: [
      'Construction d’une ligne éditoriale plus solide.',
      'Déploiement de supports de vente mieux structurés.',
      'Renforcement du rôle d’ambassadrice de la marque.',
    ],
    conclusion:
      "Ce poste doit donner envie de faire confiance à Opays avant même la première réunion. Le bon message doit être simple, net et mémorable.",
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
