# Déléguer aux agents IA
## L'échelle d'autonomie, et comment la gravir

Lundi matin, concrètement, qu'est-ce que je délègue à un agent, et comment ?*

---

Une erreur fréquente consiste à imaginer deux états : soit un humain écrit tout, soit une IA travaille seule. Comme si l'autonomie était un interrupteur.

Ce n'est pas une idée nouvelle de dire le contraire. En 1978, **Thomas Sheridan et William Verplank**, en étudiant le pilotage à distance de robots sous-marins pour l'US Navy, formalisent une échelle de **dix niveaux d'automatisation**, du niveau 1 (« l'humain fait tout ») au niveau 10 (« la machine fait tout et n'informe l'humain que si elle le juge utile »). Entre les deux : la machine propose, la machine agit sauf veto, la machine agit puis rend compte… L'industrie automobile a popularisé la même logique avec les **niveaux SAE J3016** (0 à 5) pour la conduite autonome. Personne ne demande « la voiture est-elle autonome ? » ; on demande « à quel niveau, dans quelles conditions ? ».

Pour un agent de développement, quatre paliers suffisent :

| Niveau | Rôle de l'agent | Rôle humain | Exemple concret |
| --- | --- | --- | --- |
| **Assistant** | Propose | Décide et exécute | Autocomplétion, explication d'une erreur |
| **Collaborateur** | Réalise une tâche définie | Cadre et valide le résultat | « Implémente cette user story, ouvre une PR » |
| **Supervisé** | Mène une mission | Contrôle aux points de passage | « Corrige les bugs de ce module » + PR et CI obligatoires |
| **Autonome limité** | Travaille seul dans un périmètre | Surveille les exceptions | Mise à jour automatique des dépendances |

Le point important, et c'est la thèse de Sheridan : **le niveau d'autonomie est un choix de conception, pas une propriété du modèle**. Le même modèle peut opérer au niveau 1 ou au niveau 4. Ce qui change, c'est ce qu'on construit autour.

Le dernier niveau existe d'ailleurs déjà en production depuis des années, et personne ne s'en émeut : **Dependabot** et **Renovate** ouvrent des PRs de mise à jour de dépendances de façon totalement autonome sur des millions de dépôts. Beaucoup d'équipes vont plus loin et *auto-mergent* ces PRs si la CI passe. Pourquoi cette autonomie ne fait-elle peur à personne ? Parce que le périmètre est étroit, le résultat vérifiable automatiquement, et l'action réversible. C'est l'agent autonome limité à l'état pur, avant même les LLMs.

---

## Anatomie d'une tâche déléguable (ici plutot parler du harness)

Même au bon niveau d'autonomie, une tâche mal spécifiée échoue. 

La bonne nouvelle : les critères d'une tâche déléguable à un agent sont exactement ceux d'un ticket bien écrit pour un humain, l'agilité les a formalisés depuis vingt ans (les critères INVEST, les *acceptance criteria* d'une user story). \
Les agents ne créent pas cette exigence ; ils la rendent non négociable, parce qu'un agent ne vient pas vous voir à la machine à café pour demander ce que vous vouliez dire.

Une tâche déléguable possède quatre attributs :

1. **Un objectif clair**, un état final observable, pas une direction vague.
2. **Un périmètre défini**, ce qui peut être touché, et surtout ce qui ne doit pas l'être.
3. **Des critères d'acceptation**, comment on saura que c'est fini.
4. **Une méthode de validation**, qui ou quoi vérifie, et comment.

La différence se voit immédiatement à l'usage.

Mauvaise tâche :

> « Améliore notre système. »

Bonne tâche :

> « Ajoute un mécanisme de retry sur l'appel à l'API X. Respecte la stratégie de retry existante dans `http/client.py`. Ajoute des tests couvrant timeout, erreur 5xx et erreur réseau. Ne modifie pas les contrats publics. La PR doit passer la CI et le linter. »

La seconde version contient l'objectif, le périmètre (et ses interdits), les critères et la validation. Remarquez qu'elle serait aussi la bonne façon de briefer un prestataire externe ou un junior en première semaine. C'est le même métier : la délégation ne pardonne pas l'implicite.

Les guides publiés par les fournisseurs d'agents convergent tous vers ce point. Anthropic, dans ses recommandations d'ingénierie agentique, insiste sur des environnements où l'agent dispose de critères de succès explicites et de boucles de feedback (tests, linters, CI) contre lesquelles itérer. GitHub, en documentant Copilot pour la revue de code, précise noir sur blanc que ses résultats doivent être complétés par une revue humaine, l'outil est officiellement positionné au niveau « supervisé », pas au-delà. L'équipe Codex d'OpenAI, racontant la construction d'un produit majoritairement écrit par agents, décrit un déplacement du travail humain vers la définition des intentions, la préparation de l'environnement et la conception des boucles de feedback. Trois acteurs concurrents, un même constat : la valeur se déplace de l'écriture du code vers **la spécification du problème et de sa vérification**.

---
## Conclusion

L'avenir du développement ne ressemblera probablement pas à « l'IA remplace les développeurs », mais à quelque chose de plus banal et de plus exigeant : des développeurs qui passent moins de temps à écrire du code et plus de temps à répondre à trois questions,

- à quel **niveau** de l'échelle cette tâche appartient-elle ?
- comment son résultat sera-t-il **vérifié** sans refaire le travail ?
- qu'est-ce qui justifierait de la faire **monter ou descendre** d'un niveau ?

Savoir coder restera nécessaire, ne serait-ce que pour vérifier. Mais la compétence différenciante sera la **délégation calibrée** : donner à chaque tâche exactement le niveau d'autonomie que sa vérifiabilité permet, et pas un cran de plus.

---

## Sources et références

### Niveaux d'autonomie

- **Sheridan, T.B. & Verplank, W.L. (1978)**, *Human and Computer Control of Undersea Teleoperators*. MIT Man-Machine Systems Laboratory. Rapport fondateur définissant les 10 niveaux d'automatisation.
- **Parasuraman, R., Sheridan, T.B. & Wickens, C.D. (2000)**, « A Model for Types and Levels of Human Interaction with Automation ». *IEEE Transactions on Systems, Man, and Cybernetics, Part A*, 30(3), 286-297. Raffinement du modèle : l'automatisation se règle par fonction (acquisition d'information, analyse, décision, action), pas globalement.
- **SAE International, norme J3016**, *Taxonomy and Definitions for Terms Related to Driving Automation Systems*. Les niveaux 0-5 de la conduite autonome, exemple le plus connu d'échelle d'autonomie comme choix de conception.

### Agents en production

- **Dependabot**, Documentation GitHub, *About Dependabot version updates*. Exemple d'agent autonome limité déployé à grande échelle avant l'ère des LLMs.
- **Renovate**, Documentation Mend Renovate, incluant les stratégies d'auto-merge conditionnées à la CI.
- **GitHub Copilot Code Review**, Documentation GitHub précisant que les revues générées doivent être complétées par une revue humaine. *(Formulation exacte à revérifier avant publication, la documentation évolue.)*
- **Anthropic**, *Building Effective Agents* (2024) et documentation d'ingénierie Claude Code : importance des critères de succès explicites et des boucles de feedback vérifiables. *(À revérifier : ces ressources sont mises à jour régulièrement.)*
- **OpenAI Codex**, Retours d'expérience publics de l'équipe Codex (2025) sur la construction de produits majoritairement générés par agents et le déplacement du travail humain vers la spécification et l'environnement. *(Détails à revérifier avant publication.)*

### Spécification des tâches

- **Wake, B. (2003)**, *INVEST in Good Stories, and SMART Tasks*. Les critères INVEST (Independent, Negotiable, Valuable, Estimable, Small, Testable) pour les user stories, directement transposables aux tâches d'agents.

### Article compagnon

- **« L'autonomie des agents IA : une question de système, pas de modèle »**, l'article précédent de cette série : réversibilité (portes de Bezos), ironies de l'automatisation (Bainbridge), mémoire du pourquoi (Chesterton), restriction d'environnement (Waymo), calibration.
