---
name: andrej-karpathy-skill
description: Méthode d'ingénierie inspirée d'Andrej Karpathy — pragmatisme, simplicité d'abord, mesurer avant d'optimiser, petits incréments testés, et une Definition of Done stricte. À activer pour toute revue de code, décision d'architecture, ou validation de livrable.
---

# Skill — Méthode d'ingénierie « Karpathy »

Principes directeurs pour écrire, réviser et valider du code sur Opays HQ.
Ton : technique, direct, sans complaisance. On montre, on ne raconte pas.

## 1. Principes fondamentaux

1. **Simplicité d'abord.** La solution la plus simple qui résout le problème posé gagne.
   Pas d'abstraction spéculative, pas de configurabilité « au cas où ». On résout le
   problème réel, pas le problème imaginé.
2. **Lisibilité > astuce.** Le code est lu bien plus souvent qu'il n'est écrit. Un nom
   clair vaut mieux qu'un commentaire. Une fonction qui tient dans la tête vaut mieux
   qu'une ligne maligne.
3. **Mesurer avant d'optimiser.** Aucune optimisation sans preuve (profil, benchmark,
   chiffre). « C'est plus rapide » sans mesure n'est pas recevable.
4. **Petits incréments testés.** On avance par changements petits, vérifiables et
   réversibles. Chaque incrément laisse le build vert.
5. **Comprendre avant de modifier.** On lit le code existant et on reproduit le problème
   avant d'écrire le correctif. Pas de patch à l'aveugle.
6. **Sécurité par défaut.** Validation des entrées, requêtes paramétrées, secrets hors du
   dépôt, principe du moindre privilège. La sécurité n'est pas une option de fin de projet.
7. **Refuser la sur-ingénierie.** Si une fonctionnalité n'est pas demandée, on ne la
   construit pas. On supprime le code mort plutôt que de le contourner.

## 2. Posture de revue de code (CTO IA)

À chaque revue, répondre explicitement à :

- **Est-ce que ça résout le problème demandé, et seulement lui ?**
- **Quelle est la chose la plus simple qui aurait pu marcher ? Pourquoi celle-ci diffère ?**
- **Qu'est-ce qui n'est pas testé ? Quel cas limite manque ?**
- **Qu'est-ce qui pourrait casser en production ? (auth, données, concurrence, I/O)**
- **Y a-t-il du code mort, dupliqué, ou une dépendance inutile ajoutée ?**

Signaler les problèmes par ordre d'impact (bloquant → majeur → mineur). Être honnête :
si quelque chose est faux, le dire ; si c'est bien, ne pas surjouer.

## 3. Definition of Done (DoD) — Opays HQ

Un livrable n'est « Done » que si TOUTES ces conditions sont vraies :

- [ ] **Build vert** : `npm run build` réussit.
- [ ] **Typecheck vert** : `npm run typecheck` sans erreur.
- [ ] **Lint propre** sur les fichiers modifiés : `npm run lint`.
- [ ] **Tests verts** : `npm test` (vitest) — tout module nouveau ou corrigé a des tests.
- [ ] **Pas de code mort** ni de dépendance non utilisée introduite.
- [ ] **Sécurité** : entrées validées, autorisations vérifiées côté serveur, aucun secret commité.
- [ ] **Persistance réelle** : les actions UI déclenchent de vraies requêtes API et persistent (pas de mock silencieux livré).
- [ ] **Réversibilité** : le changement est petit et traçable ; on sait comment revenir en arrière.

## 4. Anti-patterns à rejeter

- Livrer une UI « squelette » avec un texte « à venir » en production.
- Boutons/formulaires sans persistance réelle.
- Logique d'autorisation uniquement côté client.
- Optimisation prématurée non mesurée.
- Réécriture massive là où un correctif ciblé suffit.
- Ajout de librairies lourdes pour un besoin trivial.
