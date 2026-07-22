# Déléguer aux agents IA
## L'échelle d'autonomie, le harness, et comment gravir l'une grâce à l'autre

Lundi matin, concrètement, qu'est-ce que je délègue à un agent, et comment ?

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

Ce « ce qu'on construit autour » a un nom.

---

## Le harness : ce qui transforme un modèle en agent

En anglais, *harness* désigne le harnais, celui du cheval de trait. Un harnais ne rend pas le cheval plus fort. Il rend sa force **utilisable** : il la transmet, l'oriente, et permet de l'arrêter. Sans harnais, la même puissance est au mieux inutile, au pire dangereuse.

En IA, le terme désigne tout ce qui entoure le modèle pour en faire un agent opérationnel. Le mot circule depuis longtemps dans l'écosystème : dès 2021, l'outil standard d'évaluation des modèles open source s'appelle *lm-evaluation-harness* (EleutherAI), littéralement le « harnais d'évaluation ». Aujourd'hui, quand on parle du harness d'un agent de code, on parle concrètement de quatre couches :

1. **Les outils et les droits** : ce que l'agent peut faire (lire, écrire, exécuter) et où. C'est ici que vivent les permissions, les sandboxes, les listes blanches.
2. **Le contexte** : ce que l'agent sait de l'environnement. Comment il explore le dépôt, ce qu'on lui montre, comment les résultats de ses actions lui reviennent.
3. **Les boucles de feedback** : tests, linter, compilateur, CI. Tout ce qui permet à l'agent de vérifier lui-même son travail et d'itérer avant de solliciter un humain.
4. **Les points de contrôle** : les moments où l'humain reprend la main. PR obligatoire, validation avant merge, approbation avant toute commande destructive.

Voici la partie contre-intuitive, et elle est mesurée : **le harness change la performance autant que le modèle**.

La démonstration la plus propre vient de l'équipe de Princeton derrière SWE-bench, le benchmark de référence pour les agents de code (résoudre de vrais tickets GitHub sur de vrais dépôts). En 2024, leur article *SWE-agent* introduit le concept d'**Agent-Computer Interface** : plutôt que de donner au modèle un terminal brut, ils conçoivent une interface pensée pour lui, avec un éditeur qui affiche le fichier par fenêtres de 100 lignes, des retours d'erreur courts et structurés, un garde-fou qui rejette les commandes malformées avant exécution. Résultat : **avec exactement le même modèle** (GPT-4 à l'époque), le taux de résolution est multiplié par plusieurs fois par rapport aux approches précédentes. Rien n'a changé dans le cerveau. Tout a changé dans le harnais.

Anthropic a documenté le même phénomène de l'intérieur : dans un billet d'ingénierie de fin 2024 sur SWE-bench Verified, l'équipe détaille comment l'essentiel des gains est venu du travail sur le scaffold, la définition des outils d'édition, la gestion des erreurs, la possibilité pour l'agent de constater le résultat de ses actions, à modèle constant. La conclusion tient en une phrase qui devrait guider tous les budgets : une heure investie dans le harness rapporte souvent plus qu'un changement de modèle.

Et le meilleur exemple est en production depuis des années, sans un gramme de LLM : **Dependabot** et **Renovate** ouvrent des PRs de mise à jour de dépendances de façon totalement autonome sur des millions de dépôts. Beaucoup d'équipes vont plus loin et *auto-mergent* ces PRs si la CI passe. Le « modèle » sous-jacent est trivial, un moteur de règles. Ce qui rend l'autonomie possible, c'est un harness parfait : périmètre étroit (couche 1), diff lisible (couche 2), CI comme juge de paix (couche 3), auto-merge conditionnel (couche 4). C'est l'agent autonome limité à l'état pur, et la preuve que le niveau 4 de l'échelle est une propriété du harness, pas de l'intelligence.

D'où la règle de lecture de l'échelle : **on ne monte pas un agent en niveau, on monte son harness**. Confier une mission de niveau « supervisé » à un agent dont le harness n'a ni boucle de feedback ni point de contrôle, ce n'est pas de la délégation, c'est de l'abandon de poste.

---

## Le harness ne suffit pas : anatomie d'une tâche déléguable

Le harness est la partie permanente du dispositif. Reste la partie que l'humain écrit à chaque fois : la tâche. Et même dans le meilleur harness, une tâche mal spécifiée échoue.

La bonne nouvelle : les critères d'une tâche déléguable à un agent sont exactement ceux d'un ticket bien écrit pour un humain, l'agilité les a formalisés depuis vingt ans (les critères INVEST, les *acceptance criteria* d'une user story). Les agents ne créent pas cette exigence ; ils la rendent non négociable, parce qu'un agent ne vient pas vous voir à la machine à café pour demander ce que vous vouliez dire.

Une tâche déléguable possède quatre attributs, et on remarquera qu'ils répondent aux quatre couches du harness :

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

Les guides publiés par les fournisseurs d'agents convergent tous vers ce point. Anthropic, dans ses recommandations d'ingénierie agentique, insiste sur des environnements où l'agent dispose de critères de succès explicites et de boucles de feedback (tests, linters, CI) contre lesquelles itérer. GitHub, en documentant Copilot pour la revue de code, précise noir sur blanc que ses résultats doivent être complétés par une revue humaine, l'outil est officiellement positionné au niveau « supervisé », pas au-delà. L'équipe Codex d'OpenAI, racontant la construction d'un produit majoritairement écrit par agents, décrit un déplacement du travail humain vers la définition des intentions, la préparation de l'environnement et la conception des boucles de feedback. Trois acteurs concurrents, un même constat : la valeur se déplace de l'écriture du code vers **la construction du harness et la spécification des tâches qu'on y fait tourner**.

---

## Conclusion

L'avenir du développement ne ressemblera probablement pas à « l'IA remplace les développeurs », mais à quelque chose de plus banal et de plus exigeant : des développeurs qui passent moins de temps à écrire du code et plus de temps à répondre à trois questions,

- à quel **niveau** de l'échelle cette tâche appartient-elle ?
- le **harness** en place permet-il ce niveau, avec quelles boucles de feedback et quels points de contrôle ?
- qu'est-ce qui justifierait de faire **monter ou descendre** la tâche d'un niveau ?

Savoir coder restera nécessaire, ne serait-ce que pour vérifier. Mais la compétence différenciante sera la **délégation calibrée** : donner à chaque tâche exactement le niveau d'autonomie que son harness permet, et pas un cran de plus. Le cheval le plus puissant du monde ne laboure rien sans harnais. Le modèle le plus intelligent du monde non plus.

---

## Sources et références

### Niveaux d'autonomie

- **Sheridan, T.B. & Verplank, W.L. (1978)**, *Human and Computer Control of Undersea Teleoperators*. MIT Man-Machine Systems Laboratory. Rapport fondateur définissant les 10 niveaux d'automatisation.
- **Parasuraman, R., Sheridan, T.B. & Wickens, C.D. (2000)**, « A Model for Types and Levels of Human Interaction with Automation ». *IEEE Transactions on Systems, Man, and Cybernetics, Part A*, 30(3), 286-297. Raffinement du modèle : l'automatisation se règle par fonction (acquisition d'information, analyse, décision, action), pas globalement.
- **SAE International, norme J3016**, *Taxonomy and Definitions for Terms Related to Driving Automation Systems*. Les niveaux 0-5 de la conduite autonome, exemple le plus connu d'échelle d'autonomie comme choix de conception.

### Harness et interfaces agent-machine

- **Yang, J., Jimenez, C.E., Wettig, A., et al. (2024)**, *SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering*. NeurIPS 2024. L'article qui démontre qu'à modèle constant, la conception de l'interface agent-machine multiplie le taux de résolution sur SWE-bench.
  - https://arxiv.org/abs/2405.15793
- **Jimenez, C.E., Yang, J., et al. (2024)**, *SWE-bench: Can Language Models Resolve Real-World GitHub Issues?*. ICLR 2024. Le benchmark de référence des agents de code.
  - https://arxiv.org/abs/2310.06770
- **Anthropic (2024)**, *Raising the bar on SWE-bench Verified*, billet d'ingénierie détaillant les gains obtenus par le travail sur le scaffold (outils, gestion d'erreurs, feedback) à modèle constant. *(Titre et chiffres exacts à revérifier avant publication.)*
- **EleutherAI, lm-evaluation-harness** (depuis 2021), le « harnais d'évaluation » devenu standard de facto pour évaluer les modèles open source, et l'une des premières utilisations répandues du terme dans l'écosystème.
  - https://github.com/EleutherAI/lm-evaluation-harness

### Agents en production

- **Dependabot**, Documentation GitHub, *About Dependabot version updates*. Exemple d'agent autonome limité déployé à grande échelle avant l'ère des LLMs.
- **Renovate**, Documentation Mend Renovate, incluant les stratégies d'auto-merge conditionnées à la CI.
- **GitHub Copilot Code Review**, Documentation GitHub précisant que les revues générées doivent être complétées par une revue humaine. *(Formulation exacte à revérifier avant publication, la documentation évolue.)*
- **Anthropic**, *Building Effective Agents* (2024) et documentation d'ingénierie Claude Code : importance des critères de succès explicites et des boucles de feedback vérifiables. *(À revérifier : ces ressources sont mises à jour régulièrement.)*
- **OpenAI Codex**, Retours d'expérience publics de l'équipe Codex (2025) sur la construction de produits majoritairement générés par agents et le déplacement du travail humain vers la spécification et l'environnement. *(Détails à revérifier avant publication.)*

### Spécification des tâches

- **Wake, B. (2003)**, *INVEST in Good Stories, and SMART Tasks*. Les critères INVEST (Independent, Negotiable, Valuable, Estimable, Small, Testable) pour les user stories, directement transposables aux tâches d'agents.
