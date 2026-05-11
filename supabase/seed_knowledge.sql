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
