# L'autonomie des agents IA
## Une question de système, pas de modèle

**1er août 2012, 9h30.** Knight Capital, l'un des plus gros market makers américains, met en production un nouveau code de trading.
 Un serveur sur huit est oublié dans le déploiement.
 Sur ce serveur, un vieux flag réactive une fonctionnalité obsolète, dormante depuis huit ans.
 En **45 minutes**, la firme accumule **460 millions de dollars** de pertes.
 Elle ne s'en relèvera pas.


Il n'y avait pas d'IA.
 Juste un système qui pouvait agir plus vite que ses opérateurs.


**Juillet 2025, treize ans plus tard.** Jason Lemkin, fondateur de SaaStr, documente en direct son expérience de « vibe coding » sur Replit.
 En plein *code freeze*, l'instruction explicite de ne rien toucher, l'agent IA exécute un `DELETE` sur la base de production et efface les données d'environ 1 200 profils réels.
 Puis il génère des données factices pour masquer l'incident, et affirme que le rollback est impossible.
 Il ne l'était pas.
 Le CEO de Replit présentera des excuses publiques et annoncera, entre autres, une séparation forcée des environnements de développement et de production.


Treize ans d'écart, deux technologies très différentes, le même trou dans la raquette. La question intéressante en 2025 concerne moins la maturité de l'IA que celle des systèmes chargés de l'accueillir.

---

## L'ironie de l'automatisation

En 1983, l'ergonome britannique **Lisanne Bainbridge** publie un article devenu culte dans l'aéronautique, *Ironies of Automation*.
 Sa thèse tient en une phrase :

> Plus un système est automatisé, plus l'opérateur humain devient critique quand quelque chose foire.


Parce qu'automatiser retire à l'humain les tâches faciles pour ne lui laisser que les décisions les plus complexes, au moment où, ayant perdu la main, il n'a plus le contexte pour décider.


Le crash du vol Air France 447 en 2009 en est la version tragique. À 35 000 pieds au-dessus de l'Atlantique, l'autopilote se désengage, et les pilotes doivent reprendre en trois minutes le contrôle manuel d'un avion qu'ils n'exerçaient plus vraiment. Ils n'y arriveront pas.


Il existe une seconde ironie, plus insidieuse : la vigilance humaine s'érode à mesure que la fiabilité du système augmente. En 2018 à Tempe, Arizona, un véhicule autonome d'essai d'Uber percute mortellement une piétonne. Le rapport du NTSB établit que l'opératrice de sécurité, dont le rôle était justement de surveiller le système, regardait son téléphone. Après des heures de conduite autonome sans incident, son attention avait fait ce que l'attention fait toujours face à un système qui semble marcher tout seul : elle s'était éteinte.

Les agents IA reproduisent ce piège à l'identique. Un développeur qui valide cinquante PRs d'agent finira forcément par cliquer « merge » sans lire ; la cinquante-et-unième contiendra une régression subtile, et elle passera. L'autonomie ne réduit pas la charge cognitive, elle la déplace au moment le plus mauvais pour l'exercer. Un garde-fou qui suppose une vigilance humaine constante est en réalité un pari sur le fait que l'humain ne s'habituera pas au succès. C'est un pari qui perd toujours.

---

## Portes à sens unique

Jeff Bezos, dans sa lettre aux actionnaires de 2015, distingue deux types de décisions, *one-way doors* et *two-way doors* :

- **Portes à double sens** : réversibles.
 On revient si on s'est trompé.
 Décide vite, seul ou avec un petit groupe de personnes compétentes.

- **Portes à sens unique** : irréversibles.
 Aucun retour en arrière.
 Décide lentement, à plusieurs.


C'est probablement le meilleur critère pour décider ce qu'on délègue à un agent : la réversibilité de l'action, plutôt que sa complexité ou son « risque » abstrait.



| Action de l'agent            | Porte       | Autonomie |
| ---------------------------- | ----------- | --------- |
| Refactorer 10 000 lignes     | Double sens | Élevée    |
| Ouvrir une Pull Request      | Double sens | Élevée    |
| Générer des tests            | Double sens | Élevée    |
| `DELETE` sur une table prod  | Sens unique | Nulle     |
| Envoyer un mail à un client  | Sens unique | Nulle     |
| Publier un package sur npm   | Sens unique | Nulle     |
| `rm -rf` sur un volume monté | Sens unique | Nulle     |

Et la bonne nouvelle, c'est que beaucoup de portes à sens unique peuvent être *transformées* en portes à double sens, par design : git, soft delete au lieu de suppression, brouillon soumis à validation humaine, sandbox, lecture seule…

Ce tri se fait en quelques secondes, sans avoir besoin de matrice sophistiquée. Chaque ligne de la colonne de droite vaut plus qu'un point supplémentaire sur un benchmark.

Précision utile : l'irréversibilité n'est pas seulement technique. En février 2024, un tribunal canadien juge Air Canada juridiquement responsable des affirmations de son propre chatbot, qui avait inventé une politique de remboursement pour deuil (*Moffatt v. Air Canada*). L'argument de la compagnie (« le chatbot serait une entité distincte, responsable de ses propres actes ») a été balayé. Un message envoyé à un client relève de la porte à sens unique. L'irréversibilité porte sur l'engagement pris, pas sur les caractères du message.


---

## Une porte à double sens ne l'est que si le retour est testé

Le corollaire du critère de Bezos est simple mais souvent négligé : une action n'est réversible que si le mécanisme de retour a été prouvé, dans les conditions réelles, pas seulement documenté quelque part.


Le 31 janvier 2017, un ingénieur de GitLab, fatigué, en pleine gestion d'incident, lance `rm -rf` sur le mauvais serveur de base de données, db1 au lieu de db2.
 Six heures de données de production sont perdues.
 Le détail qui fait de cet incident un cas d'école : GitLab disposait de **cinq** mécanismes de sauvegarde et de restauration.
 Les cinq ont échoué.
 Le backup `pg_dump`, notamment, tournait avec une mauvaise version de PostgreSQL et produisait silencieusement des fichiers vides depuis des semaines.
 Personne ne le savait, parce que personne n'avait jamais testé une restauration.


Un mois plus tard, le 28 février 2017, une simple typo dans une commande de maintenance chez AWS retire trop de serveurs de capacité d'un coup.
 S3 tombe dans la région us-east-1, et avec lui une partie visible d'Internet, y compris, ironie parfaite, le dashboard de statut d'AWS, lui-même hébergé sur S3.
 La réponse d'Amazon dans le post-mortem est un modèle du genre : pas de « l'opérateur sera plus prudent à l'avenir ».
 À la place, l'outil lui-même a été modifié pour refuser de retirer de la capacité en dessous d'un seuil et au-delà d'une certaine vitesse.

Ces deux incidents n'impliquent aucune IA, et c'est justement le point. Les humains commettent déjà ces erreurs, et les organisations matures y ont apporté leur réponse : elles corrigent le système plutôt que de sanctionner l'opérateur. Un agent IA est fondamentalement le même profil d'opérateur, mais qui tape plus vite, ne fatigue jamais, et peut lancer une commande destructrice à répétition sans jamais douter. Si vos rollbacks n'ont jamais été testés avec des humains aux commandes, ils ne tiendront pas face à un agent.


---

## Le piège de Chesterton

G.K. Chesterton formule en 1929 un principe qui devrait être imprimé au-dessus de chaque agent IA :

> Si tu trouves une clôture au milieu d'un champ sans comprendre pourquoi elle est là, ne la détruis pas.
> Reviens quand tu sauras.


Un agent ne connaît pas l'histoire d'un codebase.
 Il ne sait pas que ce `sleep(100)` bizarre a été ajouté après un incident en 2019.
 Que cette dépendance figée en `1.4.2` évite un CVE.
 Que ce `try/except` apparemment inutile attrape un edge case qui ne s'est manifesté qu'une seule fois, un dimanche à 3h du matin, pendant le Black Friday.


L'agent voit du code apparemment mort et le nettoie. Il a raison sur ce qu'il voit, tort sur ce qu'il en conclut.

Les meilleurs environnements d'agents sont donc ceux qui conservent la meilleure mémoire du *pourquoi* : commentaires qui expliquent les décisions, ADRs versionnés, tickets d'incident reliés au code. Sans ce contexte, l'agent devient un stagiaire brillant qui refactore ce qu'il ne comprend pas.


---

## Waymo n'est pas un meilleur conducteur

Une erreur classique consiste à comparer un agent à un humain sur la tâche brute : *« GPT-5 code mieux qu'un junior. »* Peut-être.

Prenons Waymo, la filiale d'Alphabet qui exploite depuis 2020 des taxis totalement autonomes, sans chauffeur, à Phoenix puis San Francisco.

Waymo ne conduit pas mieux ou moins bien qu'un humain : Waymo conduit dans un **périmètre géofencé**, avec des cartes HD, dans quelques villes seulement, à des vitesses limitées.


Ce qui rend Waymo utilisable en production tient à la restriction de l'environnement dans lequel il évolue, davantage qu'à la qualité pure du conducteur.

L'équivalent pour un agent dev :

- accès en lecture seule sur la prod ;
- écriture uniquement dans une branche jetable ;
- exécution dans un sandbox éphémère ;
- budget en tokens et en temps ;
- liste blanche d'outils autorisés, en dur ;
- rollback automatique sur signal d'anomalie, et testé, on l'a vu.


Dans beaucoup de situations, un agent moyen dans un système bien conçu produira plus de valeur qu'un agent plus intelligent livré sans garde-fous. C'est d'ailleurs ce qui a manqué à l'agent de Replit : un mur entre lui et la production, indépendamment de ses capacités propres.


---

## Calibration > capacité

Un modèle qui répond « je ne sais pas » quand il ne sait pas vaut plus qu'un modèle qui a raison 90 % du temps avec toujours le même aplomb. Le premier laisse à l'organisation la possibilité de router les cas incertains vers un humain ; le second oblige à tout revérifier, ce qui annule le gain de temps espéré.

Il existe une profession championne du monde de cet exercice : les météorologues. Les études classiques de Murphy et Winkler (1977) montrent que lorsque les prévisionnistes du National Weather Service annoncent « 70 % de chances de pluie », il pleut effectivement environ 70 % du temps. Cette calibration quasi parfaite tient à un feedback immédiat, quotidien et sans ambiguïté : chaque prévision est confrontée à la réalité le lendemain. C'est ce type de boucle qui manque à la confiance affichée par un LLM.

C'est aussi pour cette raison que les régulateurs bancaires (Bâle II/III) et assurantiels (Solvabilité II) imposent des processus de validation, de backtesting et d'évaluation de performance des modèles internes, dont la calibration est un élément central, indépendamment de leur précision brute : un scoring qui annonce « 3 % de défaut » doit effectivement produire 3 % de défauts sur la population concernée, sinon tout le dispositif de provisionnement en aval s'effondre. Une confiance mal calibrée détruit la valeur du système en aval.

L'incident Replit en offre d'ailleurs la caricature : un agent affirmant, avec un aplomb total, qu'un rollback était impossible, alors qu'il était parfaitement faisable. Le dégât initial tenait à la commande ; le dégât aggravé tenait à la confiance mal calibrée dans la réponse.

Ce qui distinguera les prochaines générations d'agents relèvera moins de leur intelligence brute que de la finesse de leurs signaux d'incertitude, autrement dit de leur capacité à s'arrêter au bon moment pour demander de l'aide.


---

## Conclusion

Le débat actuel est mal cadré.
 On demande *« quel modèle est le meilleur ? »* alors que la vraie question est : *quelle architecture on construit autour*.


L'ingénieur qui tirera vraiment parti des agents dans les années qui viennent aura sans doute moins besoin de savoir « bien prompter » que de savoir :

- distinguer une porte à sens unique d'une porte à double sens, et transformer la première en seconde chaque fois que c'est possible ;
- installer les garde-fous avant les capacités ;
- tester les rollbacks avant d'en avoir besoin ;
- préserver la mémoire du *pourquoi* dans le code ;
- maintenir la vigilance humaine sans jamais compter dessus.

Il y a un mot, dans le milieu de l'IA agentique, qui recouvre presque tout ce dont parle cet article, et qui franchi petit à petit la barrière du grand public : le **harness** (le harnais). 
Le terme désigne ce qui entoure le modèle pour en faire un agent opérationnel : les outils qu'il peut appeler, les permissions qu'on lui accorde, le sandbox dans lequel il s'exécute, la mémoire qu'il conserve entre les sessions, les compétences et outils qu'on lui met à disposition, les hooks qui interceptent ses actions, les boucles de feedback, etc.
Deux équipes utilisant le même LLM via deux harnesses différents obtiennent, en pratique, deux produits différents.

Choisir un model n'est pas la partie la plus chronophage, adapter ou construire son harness et le système dans lequel va évoluer son agent est le travail permanent d'une équipe. 

Treize ans séparent Knight Capital de l'incident Replit. Les modèles ont énormément progressé dans l'intervalle, les systèmes qui les entourent, beaucoup moins. Knight Capital est tombé à cause de son système, non de son algorithme.
L'agent de Replit a pu effacer une base de production parce que rien, dans son environnement, ne pouvait l'en empêcher. Les prochains incidents auront la même mécanique, tant que les systèmes qui accueillent ces agents ne feront pas leur part du travail.



---

## Sources et références

### Événements et données factuelles

- **Knight Capital, 1er août 2012**, SEC, *Release No. 34-70694, In the Matter of Knight Capital Americas LLC*, 16 octobre 2013. Rapport officiel décrivant l'incident, le déploiement raté sur 1 serveur sur 8, la réactivation du code obsolète « Power Peg » et les pertes (~460 M$ au total).
    - https://www.sec.gov/files/litigation/admin/2013/34-70694.pdf
    - https://www.sec.gov/newsroom/press-releases/2013-222

- **Incident Replit / SaaStr, juillet 2025**, Récit public de Jason Lemkin (fondateur de SaaStr) documentant la suppression de la base de production par l'agent Replit pendant un code freeze, et réponse publique d'Amjad Masad (CEO de Replit) annonçant des mesures correctives (séparation dev/prod, mode planification). Largement couvert par la presse tech (Business Insider, Tom's Hardware, entre autres).

- **Moffatt v. Air Canada, février 2024**, British Columbia Civil Resolution Tribunal, décision 2024 BCCRT 149. Le tribunal juge Air Canada responsable des informations erronées fournies par son chatbot (politique de remboursement pour deuil inventée) et rejette l'argument selon lequel le chatbot serait une « entité distincte ».

- **GitLab, 31 janvier 2017**, GitLab, *Postmortem of database outage of January 31*. Post-mortem public détaillant la suppression accidentelle des données (`rm -rf` sur db1 au lieu de db2) et l'échec des cinq mécanismes de sauvegarde/restauration.
    - https://about.gitlab.com/blog/2017/02/10/postmortem-of-database-outage-of-january-31/

- **AWS S3, 28 février 2017**, Amazon Web Services, *Summary of the Amazon S3 Service Disruption in the Northern Virginia (US-EAST-1) Region*. Post-mortem officiel décrivant la commande erronée et les modifications apportées à l'outillage pour prévenir la récurrence.
    - https://aws.amazon.com/message/41926/

- **Vol Air France 447, 1er juin 2009**, Bureau d'Enquêtes et d'Analyses pour la sécurité de l'aviation civile (BEA), *Rapport final sur l'accident survenu le 1er juin 2009 à l'Airbus A330-203 immatriculé F-GZCP*, juillet 2012.
  - https://spectrum.ieee.org/air-france-flight-447-crash-caused-by-a-combination-of-factors

- **Uber ATG, Tempe, 18 mars 2018**, National Transportation Safety Board, *Highway Accident Report NTSB/HAR-19/03 (HWY18MH010)*, 2019. Rapport établissant notamment l'inattention de l'opératrice de sécurité et les défaillances organisationnelles du programme d'essais.

### Concepts et cadres théoriques

- **« Ironies of Automation »**, Bainbridge, L. (1983). *Automatica*, 19(6), 775-779. Article fondateur sur le paradoxe de l'automatisation.
    - https://www.sciencedirect.com/science/article/abs/pii/0005109883900468
- **Automation bias**, Parasuraman, R. & Riley, V. (1997). « Humans and Automation: Use, Misuse, Disuse, Abuse ». *Human Factors*, 39(2), 230-253.
- **Portes à sens unique / double sens**, Bezos, J. (2015). *Amazon Shareholder Letter*.
  - https://s2.q4cdn.com/299287126/files/doc_financials/annual/2015-Letter-to-Shareholders.PDF
- **Chesterton's Fence**, Chesterton, G.K. (1929). *The Thing*, essai « The Drift from Domesticity ».
  - https://www.chesterton.org/store/taking-a-fence-down

### Calibration et régulation du risque

- **Calibration des prévisions météo**, Murphy, A.H. & Winkler, R.L. (1977). « Reliability of Subjective Probability Forecasts of Precipitation and Temperature ». *Journal of the Royal Statistical Society, Series C*, 26(1), 41-47.
- **Bâle II**, Basel Committee on Banking Supervision (2004), *International Convergence of Capital Measurement and Capital Standards*, Pillar 1 (approche IRB).
- **Backtesting de calibration**, BCBS Working Paper No. 14 (2005), *Studies on the Validation of Internal Rating Systems*.
- **Solvabilité II**, Directive 2009/138/CE du Parlement européen et du Conseil, article 124 (*calibration standards*).
- **Calibration des réseaux de neurones**, Guo, C., Pleiss, G., Sun, Y. & Weinberger, K.Q. (2017). *On Calibration of Modern Neural Networks*. ICML.

### Contexte technique

- **Waymo**, Filiale d'Alphabet issue du projet Google Self-Driving Car. Lancement du service commercial sans chauffeur à Phoenix en octobre 2020, extension à San Francisco en 2023.
  - https://waymo.com/blog/2020/10/waymo-is-opening-its-fully-driverless-service-in-phoenix