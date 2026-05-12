-- SEED DATA FOR KNOWLEDGE BASE

INSERT INTO knowledge_articles (title, content, target_role, category) VALUES
('La Philosophie OPAYS : Vendre de la Valeur', 
'# Vendre de la Valeur, pas de la Technologie
L''erreur fondamentale est de vouloir vendre des "agents IA" ou des "chatbots".
Une entreprise n''achète pas une technologie ; elle achète la suppression d''une ligne de coût.

### Points clés :
- **Ligne de coût :** Dépense récurrente (salaire, pénalités, temps perdu).
- **Objectif :** Remplacer une dépense élevée par une solution IA moins chère.
- **Marge :** Notre but est d''augmenter la marge du client pour permettre sa croissance.',
'ALL', 'METHOD'),

('Identifier les Fuites Opérationnelles', 
'# Comment identifier les fuites d''argent
Cherchez les "robinets qui fuient" via trois critères :
1. **Tâches répétitives :** Quotidiennes ou hebdomadaires.
2. **Tâches chères :** Temps salarié/dirigeant gaspillé.
3. **Coût d''opportunité :** Ce que la tâche empêche de faire.

### Les 3 Questions Magiques :
1. « Qu’est-ce qui te bouffe ton temps en ce moment ? »
2. « À cause de quoi ça fuit ? »
3. « Si tu avais 10 heures de plus par semaine, qu’est-ce que tu ferais à la place ? »',
'SALES', 'METHOD'),

('Les 7 Véhicules IA', 
'# Choisir la bonne solution
1. **Micro-SaaS :** Outil à fonctionnalité unique.
2. **Agent IA :** Collaborateur virtuel autonome.
3. **Infrastructure IA :** Multi-agents pour PME/ETI.
4. **Système RAG :** Interrogation de base documentaire.
5. **Audit :** Diagnostic et feuille de route.
6. **Formation :** Montée en compétence.
7. **Automatisation IA :** Tâches linéaires à gros volume.',
'CTO', 'TECH'),

('Le Cycle de Déploiement en 6 Semaines', 
'# Notre Méthode de Livraison
- **S1 :** Audit et chiffrage précis de la fuite.
- **S2 :** Présentation de la proposition ROI.
- **S3 :** Cadrage technique.
- **S4 :** Développement (Claude Code / Low-code).
- **S5 :** Itérations client.
- **S6 :** Mise en production.',
'ALL', 'GUIDE');

INSERT INTO knowledge_articles (title, content, target_role, category) VALUES
(
  'Pourquoi Opays doit être AI-Native',
  '# Q: Qu''est-ce qu''une entreprise AI-Native ?
### R:
- Une entreprise AI-Native ne colle pas l''IA à la fin du processus.
- Elle conçoit l''opérationnel, le produit, le support et la vente autour d''agents IA dès le départ.

## Q: Pourquoi cela change tout ?
### R:
- Les décisions deviennent plus rapides.
- Les tâches répétitives sortent du chemin humain.
- L''équipe se concentre sur le jugement, la relation client et la création de valeur.

## Q: Qu''est-ce qu''on reprend de ce modèle ?
### R:
- La vitesse d''itération.
- L''usage de l''IA comme couche d''exécution.
- La documentation comme actif stratégique.

## Q: Qu''est-ce qu''on refuse de copier ?
### R:
- Le bruit marketing sans impact opérationnel.
- Les promesses floues du type "IA pour tout".
- Les workflows qui sacrifient la souveraineté des données.',
  'ALL',
  'VISION'
),
(
  'Automatiser 80% des tâches répétitives avec des agents',
  '# Q: Qu''est-ce qu''on automatise en premier ?
### R:
- Tout ce qui est répétitif, prévisible et mesurable: tri, relances, synthèses, reporting, affectation, classement.

## Q: Pourquoi commencer par les répétitions ?
### R:
- Parce que ce sont les tâches où l''IA apporte le plus de temps gagné pour le moins de risque.
- Parce qu''elles produisent vite un retour visible pour l''équipe.

## Q: Quel est le bon ordre ?
### R:
1. Identifier la tâche.
2. Décrire la règle.
3. Ajouter une validation humaine.
4. Connecter l''agent aux données.
5. Mesurer l''avant et l''après.

## Q: Quel est le piège à éviter ?
### R:
- Automatiser un chaos mal défini.
- Supprimer le contrôle humain sur les étapes sensibles.
- Ajouter dix outils au lieu de simplifier le flux.',
  'ALL',
  'METHOD'
),
(
  'Le Cycle Commando pour nos sprints hebdomadaires',
  '# Q: C''est quoi le Cycle Commando ?
### R:
- Une cadence courte, agressive et lisible.
- L''objectif n''est pas de faire "beaucoup", mais de livrer quelque chose de net chaque semaine.

## Q: Comment on l''applique ?
### R:
1. Lundi: définir une seule victoire critique.
2. Mardi-Mercredi: exécution profonde.
3. Jeudi: validation, QA, itérations.
4. Vendredi: livraison, documentation, rétro.

## Q: Pourquoi ça marche avec une petite équipe ?
### R:
- Parce qu''une équipe de cinq personnes ne peut pas se permettre la dispersion.
- Les rôles deviennent complémentaires et les dépendances restent visibles.

## Q: Quelle discipline garder ?
### R:
- Une mission prioritaire par personne.
- Un dashboard lisible.
- Un point de blocage unique par jour.',
  'ALL',
  'GUIDE'
),
(
  'Souveraineté des données avec des modèles mondiaux',
  '# Q: Peut-on utiliser des modèles mondiaux sans perdre notre souveraineté ?
### R:
- Oui, si nous gardons le contrôle des données, des permissions et des flux.

## Q: Quelle est la règle d''or ?
### R:
- Les modèles peuvent être mondiaux.
- Les données, la logique métier et les accès doivent rester sous notre contrôle.

## Q: Qu''est-ce qu''on doit protéger en priorité ?
### R:
- Les profils, les tâches, la trésorerie, les contrats et les savoir-faire internes.

## Q: Comment on réduit le risque ?
### R:
- RBAC strict.
- Journalisation des actions.
- Séparation claire entre lecture, écriture et validation humaine.

## Q: Quel est le bon état d''esprit ?
### R:
- Utiliser l''IA comme moteur.
- Garder l''entreprise comme pilote.',
  'ALL',
  'TECH'
),
(
  'Ce qu''on copie de la vidéo et ce qu''on adapte',
  '# Q: Qu''est-ce qu''on peut reprendre sans conflit avec notre vision ?
### R:
- La vitesse d''exécution.
- La discipline de test.
- La culture du prototype utile.
- La mise en avant du résultat, pas du buzz.

## Q: Qu''est-ce qu''on doit adapter ?
### R:
- Le langage.
- Le rythme.
- Les priorités métier.
- Le niveau de souveraineté requis pour nos clients et notre contexte.

## Q: Qu''est-ce qu''on ne doit pas importer ?
### R:
- Le culte du "move fast and break things" quand il casse la confiance.
- Les produits sans profondeur métier.
- Les processus qui dépendent d''une équipe trop large ou trop coûteuse.

## Q: Quelle est la vraie leçon ?
### R:
- On ne copie pas une esthétique.
- On copie une méthode d''exécution, puis on la rend locale, robuste et rentable.',
  'ALL',
  'VISION'
);
