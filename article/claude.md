# L'autonomie des agents IA
## Une question de système, pas de modèle
**1er août 2012, 9h30.** Knight Capital, l'un des plus gros market makers américains, met en production un nouveau code de trading. Un serveur sur huit est oublié dans le déploiement. Sur ce serveur, un vieux flag réactive une fonctionnalité obsolète, dormante depuis huit ans. En **45 minutes**, la firme accumule **460 millions de dollars** de pertes. Elle ne s'en relèvera pas.

Il n'y avait pas d'IA. Juste un système qui pouvait agir plus vite que ses opérateurs.

Aujourd'hui, on veut donner à des agents IA des accès équivalents : modifier du code, exécuter des commandes, déployer, appeler des APIs payantes, ouvrir des tickets. La question n'est plus « l'IA est-elle prête ? ». C'est : **et nos systèmes, le sont-ils ?**

---

## L'ironie de l'automatisation

En 1983, l'ergonome britannique **Lisanne Bainbridge** publie un article devenu culte dans l'aéronautique, *Ironies of Automation*. Sa thèse tient en une phrase :

> Plus un système est automatisé, plus l'opérateur humain devient critique quand quelque chose foire.

Parce qu'automatiser retire à l'humain les tâches faciles, et lui laisse uniquement les décisions les plus complexes — précisément au moment où, ayant perdu la main, il n'a plus le contexte pour décider.

Le crash du **vol Air France 447** en 2009 en est la version tragique. 
L'autopilote se désengage à 35 000 pieds au-dessus de l'Atlantique. 
Les pilotes doivent reprendre en trois minutes le contrôle manuel d'un avion, une tâche qu'ils n'exerçaient presque plus.
Ils n'y arrivent pas.

Les agents IA reproduisent exactement ce piège. Un dev qui valide cinquante PRs générées finit par cliquer « merge » sans lire. Puis un jour, la 51ᵉ contient une régression subtile — et elle passe. L'autonomie ne réduit pas la charge cognitive. Elle la déplace vers le pire moment pour l'exercer.

---

## Portes à sens unique

Jeff Bezos, dans sa lettre aux actionnaires de 2015, distingue deux types de décisions "One-way doors / Two-way doors" : 

En français :
- **Portes à double sens** : réversibles. On revient si on s'est trompé. Décide vite, seul ou avec un petit groupe de personnes compétentes.
- **Portes à sens unique** : irréversibles. Aucun retour en arrière. Décide lentement, à plusieurs.

C'est probablement le meilleur critère pour calibrer la délégation à un agent. Pas la complexité. Pas le « risque » vaguement défini. La **réversibilité**.

| Action de l'agent                  | Porte        | Autonomie |
| ---------------------------------- | ------------ | --------- |
| Refactorer 10 000 lignes           | Double sens  | Élevée    |
| Ouvrir une Pull Request            | Double sens  | Élevée    |
| Générer des tests                  | Double sens  | Élevée    |
| `DELETE` sur une table prod        | Sens unique  | Nulle     |
| Envoyer un mail à un client        | Sens unique  | Nulle     |
| Publier un package sur npm         | Sens unique  | Nulle     |
| `rm -rf` sur un volume monté       | Sens unique  | Nulle     |

Le tri se fait en cinq secondes, sans framework, sans matrice, sans modèle.

---

## Le piège de Chesterton

G.K. Chesterton formule en 1929 un principe qui devrait être imprimé au-dessus de chaque agent IA :

> Si tu trouves une clôture au milieu d'un champ sans comprendre pourquoi elle est là, ne la détruis pas. Reviens quand tu sauras.

Un agent ne connaît pas l'histoire d'un codebase. Il ne sait pas que ce `sleep(100)` bizarre a été ajouté après un incident en 2019. Que cette dépendance figée en `1.4.2` évite un CVE. Que ce `try/except` apparemment inutile attrape un edge case qui ne s'est manifesté qu'une seule fois — un dimanche à 3h du matin, pendant la Black Friday.

L'agent voit du code mort. Il le nettoie. Il a raison sur la lecture, tort sur la conclusion.

C'est pourquoi les meilleurs environnements d'agents ne sont pas ceux avec le meilleur modèle, mais ceux avec la meilleure **mémoire du pourquoi** : commentaires qui expliquent les décisions, ADRs versionnés, tickets d'incident liés au code. Sans ce contexte, l'agent devient un stagiaire brillant qui refactore ce qu'il ne comprend pas.

---

## Waymo n'est pas un meilleur conducteur

Une erreur classique consiste à comparer un agent à un humain sur la tâche brute : *« GPT-5 code mieux qu'un junior. »* Peut-être. 
Prenons Waymo, la filiale de Google qui exploite depuis 2020 des taxis totalement autonomes, sans chauffeur, à Phoenix et San Francisco. 
Waymo ne conduit pas mieux ou moins bien qu'un humain : Waymo conduit dans un **périmètre géofencé**, avec des cartes HD, dans quelques villes seulement, à des vitesses limitées.

Ce qui rend Waymo utilisable n'est pas la qualité du conducteur. C'est la **restriction de l'environnement**.
La performance d'un système autonome ne vient pas uniquement de l'intelligence du modèle, mais aussi de l'environnement contrôlé autour.

L'équivalent pour un agent dev :

- accès en lecture seule sur la prod ;
- écriture uniquement dans une branche jetable ;
- exécution dans un sandbox éphémère ;
- budget en tokens et en temps ;
- liste blanche d'outils autorisés, en dur ;
- rollback automatique sur signal d'anomalie.

Dans de nombreux cas, un agent moyen dans un système bien conçu peut surpasser un agent plus performant livré sans garde-fous.
---

## Calibration > capacité

Un modèle qui répond *« je ne sais pas »* quand il ne sait pas vaut plus qu'un modèle qui a raison 90 % du temps avec toujours le même aplomb.

Pourquoi ? Parce que le premier permet une **stratégie** : router les cas incertains vers un humain. Le second oblige à tout vérifier.

C'est exactement pour cette raison que les régulateurs bancaires (**Bâle II/III**) et assurantiels (**Solvabilité II**) 
imposent des processus de **validation**, de **backtesting** et d'**évaluation de performance** des modèles internes, dont la **calibration** est un élément important
indépendamment de leur précision brute : un scoring qui dit « 3 % de défaut » doit effectivement produire 3 % de défauts sur la population concernée, sinon tout le dispositif de provisionnement en aval s'effondre. La confiance mal calibrée détruit toute la valeur du système.

Le prochain vrai saut de performance des agents ne viendra probablement pas de modèles plus intelligents. Il viendra de meilleurs **signaux d'incertitude** — la capacité à s'arrêter et demander au bon moment.

---

## Conclusion

Le débat actuel est mal cadré. On demande *« quel modèle est le meilleur ? »* alors que la vraie question est : *quelle architecture on construit autour*.

L'ingénieur de la décennie à venir ne sera pas celui qui prompt le mieux. Ce sera celui qui sait :

- distinguer une porte à sens unique d'une porte à double sens ;
- installer les garde-fous **avant** les capacités ;
- préserver la mémoire du *pourquoi* dans le code ;
- maintenir la vigilance humaine sans jamais compter dessus.

Knight Capital n'est pas mort d'un mauvais algorithme. Il est mort d'un mauvais système. Nos agents ne feront pas exception.

---

## Sources et références

### Événements et données factuelles

- **Knight Capital, 1er août 2012** — SEC, *Release No. 34-70694, In the Matter of Knight Capital Americas LLC*, 16 octobre 2013. Rapport officiel décrivant l'incident, le déploiement raté sur 1 serveur sur 8, la réactivation du code obsolète « Power Peg » et les pertes (~460 M$ au total).

  - https://www.sec.gov/files/litigation/admin/2013/34-70694.pdf
  - https://www.sec.gov/newsroom/press-releases/2013-222
  - https://www.sec.gov/Archives/edgar/data/1569391/000144530514000824/kcg2013123110-k.html

- **Vol Air France 447, 1er juin 2009** — Bureau d'Enquêtes et d'Analyses pour la sécurité de l'aviation civile (BEA), *Rapport final sur l'accident survenu le 1er juin 2009 à l'Airbus A330-203 immatriculé F-GZCP*, juillet 2012.
  - https://spectrum.ieee.org/air-france-flight-447-crash-caused-by-a-combination-of-factors
### Concepts et cadres théoriques

- **« Ironies of Automation »** — Bainbridge, L. (1983). *Automatica*, 19(6), 775-779. Article fondateur sur le paradoxe de l'automatisation en aéronautique.
  - https://www.sciencedirect.com/science/article/abs/pii/0005109883900468
  - https://arxiv.org/abs/2402.11364
- **Automation bias** — Parasuraman, R. & Riley, V. (1997). « Humans and Automation: Use, Misuse, Disuse, Abuse ». *Human Factors*, 39(2), 230-253.
- **Portes à sens unique / double sens** — Bezos, J. (2015). *Amazon Shareholder Letter*. Disponible sur `aboutamazon.com`.
  - https://s2.q4cdn.com/299287126/files/doc_financials/annual/2015-Letter-to-Shareholders.PDF
- **Chesterton's Fence** — Chesterton, G.K. (1929). *The Thing*, essai « The Drift from Domesticity ». Traduction libre du principe formulé
  - https://www.chesterton.org/store/taking-a-fence-down

### Calibration et régulation du risque

- **Bâle II** — Basel Committee on Banking Supervision (2004), *International Convergence of Capital Measurement and Capital Standards*, Pillar 1 (approche IRB).
- **Backtesting de calibration** — BCBS Working Paper No. 14 (2005), *Studies on the Validation of Internal Rating Systems*.
- **Solvabilité II** — Directive 2009/138/CE du Parlement européen et du Conseil, article 124 (*calibration standards*).
- **Calibration des réseaux de neurones** — Guo, C., Pleiss, G., Sun, Y. & Weinberger, K.Q. (2017). *On Calibration of Modern Neural Networks*. ICML.

### Contexte technique

- **Waymo** — Filiale d'Alphabet issue du projet Google Self-Driving Car. Lancement du service commercial sans chauffeur à Phoenix en octobre 2020, extension à San Francisco en 2023.
  - https://waymo.com/blog/2020/10/waymo-is-opening-its-fully-driverless-service-in-phoenix
  - https://arxiv.org/abs/2011.00038