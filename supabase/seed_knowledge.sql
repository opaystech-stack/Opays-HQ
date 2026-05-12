-- SEED DATA FOR KNOWLEDGE BASE

INSERT INTO knowledge_articles (title, content, target_role, category) VALUES
('La Philosophie OPAYS : Aider avant tout', 
'# Vendre une amélioration concrète, pas un mot à la mode
Une entreprise n''achète pas une technologie pour faire joli.
Elle cherche surtout à gagner du temps, réduire les erreurs et mieux servir ses clients.

### Points clés :
- **Problème réel :** Ce qui coûte du temps, de l''argent ou de l''énergie.
- **Solution utile :** Ce qui enlève de la charge sans compliquer le travail.
- **Impact :** Ce que l''équipe et le client ressentent vraiment au quotidien.',
'ALL', 'METHOD'),

('Identifier les Fuites Opérationnelles', 
'# Comment repérer ce qui ralentit l''équipe
Cherchez les activités qui reviennent souvent, prennent trop de temps ou créent de la confusion.

### Les 3 questions simples :
1. Qu''est-ce qui te prend le plus de temps en ce moment ?
2. Qu''est-ce qui te bloque ou te fait perdre de l''énergie ?
3. Si on supprimait cette tâche, qu''est-ce qui changerait vraiment ?',
'SALES', 'METHOD'),

('Les 7 Véhicules IA', 
'# Choisir la bonne solution pour le bon besoin
1. **Petit outil dédié :** Une seule fonction, simple et claire.
2. **Assistant IA :** Aide pour écrire, résumer ou organiser.
3. **Organisation assistée :** Plusieurs assistants qui travaillent ensemble.
4. **Base de savoir :** Réponses à partir de nos documents.
5. **Audit :** Comprendre ce qui bloque et quoi corriger.
6. **Formation :** Aider les équipes à mieux faire leur travail.
7. **Automatisation :** Faire gagner du temps sur les tâches répétitives.',
'CTO', 'TECH'),

('Le Cycle de Déploiement en 6 Semaines', 
'# Notre méthode de livraison
- **S1 :** Comprendre le besoin et le problème réel.
- **S2 :** Expliquer la solution et le gain attendu.
- **S3 :** Cadrer ce qu''on va faire exactement.
- **S4 :** Construire la première version.
- **S5 :** Corriger avec les retours.
- **S6 :** Mettre en service et documenter.',
'ALL', 'GUIDE');

INSERT INTO knowledge_articles (title, content, target_role, category) VALUES
(
  'Pourquoi Opays est une entreprise AI-Native',
  '# Q: Qu''est-ce qu''une entreprise AI-Native ?
### R:
- C''est une entreprise qui utilise l''IA dans son travail quotidien, pas seulement dans son discours.
- L''IA sert à faire gagner du temps, mieux organiser le travail et réduire les erreurs.

## Q: Pourquoi cela change tout ?
### R:
- Les tâches répétitives prennent moins de place.
- Les décisions peuvent être prises plus vite.
- L''équipe garde plus de temps pour le client et la qualité.

## Q: Qu''est-ce qu''on reprend de ce modèle ?
### R:
- L''habitude de travailler simplement avec l''IA.
- La rapidité de test.
- Les documents clairs qui servent vraiment au travail.

## Q: Qu''est-ce qu''on refuse de copier ?
### R:
- Le jargon vide.
- Les outils compliqués pour rien.
- Les systèmes qui mettent nos données en danger.',
  'ALL',
  'VISION'
),
(
  'Comment utiliser l''IA sans être technique',
  '# Q: Faut-il savoir coder pour utiliser l''IA chez Opays ?
### R:
- Non. Il faut surtout savoir expliquer clairement ce qu''on veut obtenir.
- L''IA aide à écrire, résumer, classer, préparer ou reformuler.

## Q: À quoi peut-elle m''aider au quotidien ?
### R:
- Préparer un message.
- Résumer une réunion.
- Organiser une idée.
- Faire un premier brouillon.
- Trouver une formulation plus claire.

## Q: Quelle est la bonne manière de demander ?
### R:
- Dire le but.
- Dire à qui c''est destiné.
- Dire le format attendu.
- Donner un exemple si on en a un.

## Q: Qu''est-ce qu''il faut éviter ?
### R:
- Les demandes floues.
- Les consignes contradictoires.
- Laisser l''IA décider seule sur des sujets sensibles.',
  'ALL',
  'METHOD'
),
(
  'Notre rythme de travail hebdomadaire',
  '# Q: Pourquoi avons-nous besoin d''un rythme commun ?
### R:
- Parce que tout le monde gagne du temps quand les priorités sont claires.
- Parce qu''une petite équipe doit éviter la dispersion.

## Q: Comment organiser une semaine simple ?
### R:
1. Choisir une priorité importante.
2. Avancer dessus avec régularité.
3. Vérifier les blocages.
4. Partager l''avancement.
5. Corriger avant de repartir.

## Q: Pourquoi ce rythme est utile ?
### R:
- On sait ce qu''on attend de chacun.
- On voit vite ce qui avance et ce qui bloque.
- On garde une bonne coordination entre les rôles.',
  'ALL',
  'GUIDE'
),
(
  'Protéger les informations de l''entreprise',
  '# Q: Pourquoi faut-il faire attention aux informations internes ?
### R:
- Parce qu''elles ont de la valeur.
- Parce qu''une fuite d''information peut créer de la confusion ou du risque.

## Q: Qu''est-ce qu''on ne partage pas n''importe comment ?
### R:
- Les données clients.
- Les informations financières.
- Les documents sensibles.
- Les accès techniques.

## Q: Quel est le bon réflexe ?
### R:
- Si on n''est pas sûr, on demande.
- Si un accès semble inutile, on le signale.
- Si un document est sensible, on le partage seulement aux bonnes personnes.',
  'ALL',
  'TECH'
),
(
  'Travailler ensemble dans une petite équipe',
  '# Q: Pourquoi les rôles doivent être clairs ?
### R:
- Parce que quand chacun sait ce qu''il doit faire, tout le monde avance plus vite.
- Les erreurs viennent souvent des zones floues.

## Q: Qu''est-ce que chacun doit comprendre ?
### R:
- Son rôle.
- Ce qu''il doit livrer.
- À qui demander de l''aide.
- Quand prévenir les autres.

## Q: Quelle attitude aide vraiment ?
### R:
- Être simple.
- Être fiable.
- Être réactif.
- Respecter le travail des autres.',
  'ALL',
  'VISION'
),
(
  'Le pitch simple pour expliquer notre valeur',
  '# Q: Comment présenter Opays en une phrase ?
### R:
- Nous aidons les entreprises à enlever les lourdeurs qui leur font perdre du temps, de l''énergie et de l''argent.

## Q: Comment expliquer le bénéfice sans parler technique ?
### R:
- Nous simplifions le travail.
- Nous réduisons les erreurs.
- Nous accélérons les réponses.
- Nous remettons l''équipe sur ce qui compte vraiment.

## Q: Quelle image peut aider ?
### R:
- Imagine une entreprise qui porte trop de poids inutile.
- Notre rôle est d''enlever ce qui ralentit, pour qu''elle avance plus vite et plus facilement.

## Q: Que faut-il éviter ?
### R:
- Dire que l''IA est magique.
- Parler trop de technologie.
- Oublier le résultat concret pour le client.',
  'SALES',
  'VISION'
),
(
  'Les bénéfices d''un audit IA',
  '# Q: À quoi sert un audit IA ?
### R:
- À voir où le temps se perd.
- À repérer les erreurs répétées.
- À comprendre ce qui coûte trop d''effort.

## Q: Quels bénéfices met-on en avant ?
### R:
1. **Temps gagné** - moins d''heures perdues sur des tâches répétitives.
2. **Moins d''erreurs** - moins de corrections et de retours en arrière.
3. **Moins de friction** - le travail devient plus simple pour l''équipe.
4. **Moins de blocages** - l''information circule mieux.
5. **Meilleures priorités** - l''équipe se concentre sur ce qui crée de la valeur.

## Q: Comment le dire simplement ?
### R:
- L''audit montre ce qui ralentit votre entreprise.
- Ensuite, on propose une manière plus simple de travailler.',
  'SALES',
  'METHOD'
),
(
  'Répondre aux objections sur la sécurité',
  '# Q: Que répondre si un client a peur pour ses données ?
### R:
- C''est une bonne question, et elle est normale.
- Nous travaillons justement pour protéger les informations et contrôler les accès.

## Q: Comment rassurer sans promettre trop ?
### R:
- Nous limitons ce qui est partagé.
- Nous définissons qui peut voir quoi.
- Nous gardons une trace des actions importantes.
- Nous ne mélangeons pas les données sensibles avec des usages inutiles.

## Q: Quelle phrase simple peut être utilisée ?
### R:
- L''IA nous aide à travailler plus vite, mais vos données restent sous contrôle.

## Q: Que faut-il éviter ?
### R:
- Minimiser la peur du client.
- Donner une réponse trop technique.
- Faire comme si la sécurité n''était pas importante.',
  'SALES',
  'GUIDE'
),
(
  'Template de proposition de valeur',
  '# Q: Quelle est l''idée d''une bonne proposition de valeur ?
### R:
- Montrer d''abord le problème, puis la solution, puis le résultat attendu.

## Q: Quelle structure utiliser ?
### R:
1. **Situation actuelle** - comment l''équipe travaille aujourd''hui.
2. **Point de blocage** - où se perd le temps ou l''énergie.
3. **Impact concret** - ce que cela coûte en pratique.
4. **Approche Opays** - comment nous simplifions le travail.
5. **Résultat attendu** - ce que le client gagne.

## Q: Pourquoi cette structure marche ?
### R:
- Parce qu''elle parle du vrai problème du client.
- Parce qu''elle reste simple à comprendre.
- Parce qu''elle montre la valeur avant la discussion finale.',
  'SALES',
  'METHOD'
),
(
  'Les bonnes questions avant de proposer',
  '# Q: Pourquoi poser de bonnes questions ?
### R:
- Parce qu''on ne peut pas proposer une vraie aide sans comprendre la situation.

## Q: Quelles questions utiliser ?
### R:
- Qu''est-ce qui vous prend le plus de temps aujourd''hui ?
- Où est-ce que l''équipe perd le plus d''énergie ?
- Qu''est-ce qui crée des erreurs ou des retards ?
- Si ce point disparaissait, qu''est-ce qui changerait ?

## Q: Que fait une bonne question ?
### R:
- Elle ouvre la discussion.
- Elle révèle le vrai besoin.
- Elle évite de vendre trop tôt.',
  'SALES',
  'GUIDE'
);
