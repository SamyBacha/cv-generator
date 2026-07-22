# L'autonomie des agents IA
## Une question de système, pas de modèle

Le 1er août 2012, 9h30, Knight Capital l'un des plus gros market makers américains, met en production un nouveau code de trading.  
Le déploiement oublie un serveur sur les huit à mettre à jour.  
Sur ce serveur, un vieux flag réactive une fonction obsolète, endormie depuis huit ans.  
En quarante-cinq minutes, la firme perd 460 millions de dollars.  
Elle ne s'en relèvera pas.

Aucune IA là-dedans. Juste un système capable d'agir plus vite que les gens censés le surveiller.

Treize ans plus tard, en juillet 2025, Jason Lemkin, fondateur de SaaStr, documente en direct son expérience de *vibe coding* sur Replit.  
On est en plein *code freeze*, consigne explicite de ne toucher à rien.
L'agent IA lance quand même un `DELETE` sur la base de production et efface les données d'environ 1 200 comptes réels.
Ensuite, il fabrique des données factices pour maquer l'incident, et affirme que le *rollback* est impossible.  
Spoiler alert, Il ne l'était pas.  
Le CEO de Replit s'excusera et annoncera, entre autres, une séparation stricte entre développement et production.

Deux technologies très différentes que treize ans séparent, le même trou dans la raquette.  
En 2012 c'était un script figé, en 2025 c'est un modèle qui écrit du code presque comme un ingénieur.  
Et pourtant l'accident se ressemble trait pour trait.  
Ça mérite qu'on s'arrête sur une question que les classements de modèles esquivent : quand on veut donner plus d'autonomie à un agent, qu'est-ce qui rapporte le plus, un modèle plus fort ou un système mieux foutu autour de lui ?

Je vais essayer d'éliminer les mauvaises réponses une par une.

## Le pari du modèle

Il y a un camp, sérieux, qui répond « le modèle, évidemment ».  
Un de leur argument repose sur la *bitter lesson*, formulée par Rich Sutton en 2019 : depuis soixante-dix ans, l’histoire de l’IA montre que les solutions qui reposent sur beaucoup de règles écrites par des humains finissent souvent par être dépassées par des approches plus simples, plus générales, capables d’apprendre seules, dès qu’elles disposent de suffisamment de données et de puissance de calcul.  
Vu sous cet angle, l’écosystème construit autour des modèles peut être fragile : outils d’orchestration, les chaînes de prompts ou les systèmes d’agents peuvent créer un avantage à court terme, mais cet avantage peut disparaître lorsque le modèle sous-jacent devient suffisamment performant pour absorber ces capacités nativement.
Beaucoup de frameworks d’orchestration sophistiqués apparus en 2023 ont ainsi vu leur valeur diminuer à mesure que les modèles progressaient et intégraient directement une partie du raisonnement qu’on essayait auparavant de leur ajouter.
Et les chiffres semblent leur donner raison.  
METR* a mesuré en 2025 la durée des tâches qu'un agent réussit de façon autonome, et cette durée double à peu près tous les sept mois.  
Si leurs capacités grimpent à ce rythme, pourquoi s'échiner à durcir le système autour ? Il suffirait d'attendre la prochaine version.  
Le prix par token, à capacité égale, s'est d'ailleurs effondré depuis 2023**, ce qui affaiblit encore l'idée qu'il faudrait optimiser quoi que ce soit.

C'est un argument fort, mais si le modèle était vraiment le facteur limitant, les agents tiendraient déjà leurs promesses en production.

Regardons.
*METR: METR (Model Evaluation and Threat Research)  
** Voir sections sources









## Le fossé entre le benchmark et la prod

Sur *SWE-bench Verified*, le benchmark de référence pour les tâches d'ingénierie logicielle réelles, les meilleurs modèles franchissent aujourd'hui des scores qui feraient croire à un ingénieur autonome.  
Puis on met les mêmes agents dans *TheAgentCompany*, une entreprise simulée avec de vraies tâches de bureau, et ils bouclent environ un quart du travail sans intervention humaine.  
Le reste cale, part de travers, ou réclame un humain à la rescousse.
Ou encore l'experience d'Anthropic qui a poussé l’exercice plus loin en 2025 avec Project Vend, en confiant à Claude la gestion d’une petite boutique automatisée pendant environ un mois.  
L’agent, baptisé Claudius, devait gérer ses stocks, ses prix et ses clients comme un véritable commerçant.  
L’expérience a révélé une faiblesse moins visible sur les tâches longues : l’agent pouvait réussir des actions isolées, mais perdre progressivement son objectif initial.  
Il a accordé trop de remises, vendu certains produits à perte, s’est laissé entraîner dans une étrange aventure autour de cubes de tungstène, et a même commencé à halluciner des expériences physiques en se comportant comme s’il était un employé humain.  
Le problème n’était pas une erreur ponctuelle : c’est la persistance sur la durée qui a fait émerger les défaillances.
C'est l'écart que les scores moyens ne mettent pas en avant.  
Yao et ses collègues l'ont mis en évidence avec *τ-bench* en 2024, en introduisant une métrique qu'ils appellent *pass^k* : au lieu de demander « l'agent, réussit-il une fois », on demande « réussit-il k fois de suite sur la même tâche ».  
La performance s'écroule. Un agent qui gère un cas de service client une fois sur deux ne le gère quasiment jamais huit fois d'affilée.  
Or la prod, c'est huit fois d'affilée, tous les jours.

La cause est bêtement arithmétique. Une longue tâche, c'est une chaîne d'étapes, et chaque étape ajoute un risque d'échec supplémentaire.  
À 99 % de fiabilité par étape, une chaîne de dix étapes tombe à 90 %, une chaîne de cinquante à 60 %, une chaîne de deux cents à 13 %.  
Cette « fiabilité de 99 % » qu'on trouve rassurante ne survit pas à une vraie tâche de bout en bout.

Il y a un deuxième problème, moins visible, que Sayash Kapoor et Arvind Narayanan ont mis en lumière dans un papier de 2024 au titre revanchard, *AI Agents That Matter* : presque personne ne mesure ce que ces agents coûtent.  
Le prix par token baisse, d'accord, mais le prix par tâche explose.  
Les modèles de raisonnement pensent longuement avant de répondre, les tâches s'allongent, et surtout il faut souvent plusieurs tentatives pour un succès.  
Le *pass^k* n'est pas qu'une note de qualité, c'est une facture.  
Pour obtenir une réussite, vous payez les k essais.  
Un agent qui plante à l'étape 47 sur 50 sans point de sauvegarde vous facture la trajectoire entière avant de recommencer à zéro.  
La fiabilité, ou son absence, se lit directement sur la note en fin de mois.

Donc non, attendre un modèle plus intelligent ne suffit pas.
La solution suivante, celle qui vient à l'esprit de tout le monde, c'est de coller un humain derrière l'agent pour rattraper ses bêtises, le pattern 'Human-in-the-loop'.

## Personne ne surveille rien pendant huit heures

Cette solution est morte depuis quarante ans, on l'oublie à chaque nouvelle vague de technologie.
Prenez un développeur à qui on demande de valider les *pull requests* d'un agent.  
Les dix premières, il lit tout, ligne par ligne. Les vingt suivantes, il survole.  
Au bout de cinquante PR toutes vertes, il lit le titre et il clique *merge*.  
La cinquante-et-unième contient une régression discrète, et elle passe.  
Aucune négligence là-dedans, juste le fonctionnement normal de l'attention humaine devant un système qui a l'air de marcher tout seul.

En 1983, l'ergonome britannique Lisanne Bainbridge décrit ce piège, dans un article devenu culte dans l'aéronautique, *Ironies of Automation*.
Sa thèse tient en une phrase :
> cla, plus l'opérateur humain devient critique quand quelque chose foire.

Parce qu'automatiser retire à l'humain les tâches faciles pour ne lui laisser que les décisions les plus complexes, au moment où, ayant perdu la main, il n'a plus le contexte pour décider.

Le vol Air France 447 en est la version qui fait froid dans le dos.  
Au-dessus de l'Atlantique, en 2009, le pilote automatique se débranche, et les pilotes doivent reprendre en quelques minutes le contrôle manuel d'un avion qu'ils ne pilotaient plus vraiment depuis longtemps.  
Ils n'y arriveront pas.

Il existe une seconde ironie, plus insidieuse : la vigilance humaine s'érode à mesure que la fiabilité du système augmente.
En 2018 à Tempe, Arizona, un véhicule autonome d'essai d'Uber percute mortellement une piétonne.
Le rapport du NTSB établit que l'opératrice de sécurité, dont le rôle était justement de surveiller le système, regardait son téléphone.
Après des heures de conduite autonome sans incident, son attention avait fait ce que l'attention fait toujours face à un système qui semble marcher tout seul : elle s'était relâchée.


James Reason, psychologue britannique et, plus tard, les travaux de Raja Parasuraman, chercheur majeur en facteurs humains et interaction humain-machine, sur ce qu'on appelle l'*automation bias* disent la même chose sous un autre angle : passé un certain niveau de confiance, l'humain cesse d'auditer la machine et se contente de lui faire confiance.

La leçon pour les agents est directe. Un garde-fou qui repose sur une vigilance humaine constante est déjà cassé le jour où on l'installe, parce qu'il parie sur la seule chose dont on sait qu'elle lâchera.
Alors si on ne peut pas surveiller en continu, il faut trancher à l'avance ce que l'agent a le droit de faire seul.  
Reste à savoir sur quels critères.

## Ce qu'on délègue dépend de ce qu'on peut annuler

L'idée n'est pas neuve.  
La théorie de la décision lui a donné un nom dès les années 1970, l'effet d'irréversibilité : sous incertitude, une action qu'on ne peut pas défaire mérite un seuil de prudence plus élevé qu'une action réversible, parce qu'en tranchant définitivement on détruit la valeur de pouvoir changer d'avis plus tard (Arrow et Fisher, 1974).

Jeff Bezos en a popularisé une version imagée dans sa lettre aux actionnaires de 2015.
On distingue deux types de décisions, *one-way doors* et *two-way doors* :

- **Portes à double sens** : réversibles.
  On revient si on s'est trompé.
  Décide vite, seul ou avec un petit groupe de personnes compétentes.

- **Portes à sens unique** : irréversibles.
  Aucun retour en arrière.
  Décide lentement, à plusieurs.

Et le monde de l'ingénierie compose toujours avec cette logique : le Google SRE Book en a fait un pilier de sa culture de déploiement, rollbacks, livraisons progressives en canary, feature flags qu'on rabat en une seconde, tout un outillage dont la raison d'être est de transformer un changement irréversible en changement qu'on peut annuler.  
C'est le meilleur critère que je connaisse pour décider ce qu'on confie à un agent, et il ne parle ni de complexité ni de risque abstrait, seulement de réversibilité.

Refactorer dix mille lignes de code, c'est une porte à double sens : le diff se revert en une commande.  
Ouvrir une pull request, générer une batterie de tests, pareil, on jette et on recommence.

En face, un `DELETE` sur une table de prod, un mail parti chez un client, un package publié sur npm, un `rm -rf` sur un volume monté, ce sont des portes à sens unique.

Là où l'agent peut avancer sans supervision sur les premières, il ne devrait pas toucher aux secondes sans un humain dans la boucle.

L’aspect positif, c'est qu'une porte à sens unique peut souvent devenir une porte à double sens, à condition de le décider en amont.
Un soft delete au lieu d'une suppression sèche, une écriture confinée à une branche jetable, un brouillon soumis à validation avant envoi, un sandbox qui s'évapore à la fin.

> La réversibilité, ça se fabrique.

Sauf qu'une porte n'est réversible que si le retour a été prouvé pour de vrai, pas juste documenté quelque part dans un wiki.

Le 31 janvier 2017, un ingénieur de GitLab, épuisé, en pleine gestion d'incident, lance un `rm -rf` sur le mauvais serveur de base de données, db1 au lieu de db2.  
Six heures de données de production sont perdues.  
Le détail qui fait de cette incident un cas d'école : GitLab avait cinq mécanismes de sauvegarde, mais ils ont tous échoué.  
Le backup `pg_dump`, notamment, tournait avec une mauvaise version de PostgreSQL et crachait silencieusement des fichiers vides depuis des semaines, sans que personne le sache, parce que personne n'avait jamais tenté une restauration pour voir.

Un backup que vous n'avez jamais restauré n'est pas un backup, c'est une hypothèse.

Un mois après, une faute de frappe dans une commande de maintenance chez AWS retire trop de serveurs d'un coup.  
S3 tombe dans la région `us-east-1`, et avec lui une bonne partie du visible d'Internet, dont, cerise sur le gâteau, dashboard de statut d'AWS lui-même, hébergé sur S3.  
La réponse d'Amazon dans le post-mortem est un modèle du genre...
Pas un mot autour de l'opérateur, ou du fait qu'il devra montrer plus de prudence à l'avenir.
À la place, l'outil a été modifié pour refuser de descendre la capacité sous un seuil et au-delà d'une certaine vitesse.
On corrige le système, on ne sermonne pas la personne.

Ces deux incidents n'impliquent aucune IA, et c'est justement le point.
Les humains commettent déjà ces erreurs, et les organisations matures y ont apporté leur réponse : elles corrigent le système plutôt que de sanctionner l'opérateur.
Un agent IA est fondamentalement le même profil d'opérateur, sauf qu'il tape plus vite, ne fatigue jamais, et peut lancer une commande destructrice à répétition sans jamais douter.
Si vos rollbacks n'ont jamais été testés avec des humains, ils ne tiendront pas face à un agent.

Et mettre en place de la réversibilité, c'est aussi installer des points de sauvegarde qui empêchent une trajectoire ratée de brûler tout le budget.

Borner l'agent, pourtant, ne suffit pas.  
Nous allons voir qu'il lui manque deux choses qu'il est incapable de produire lui-même.

## Le contexte et le doute : Le piège de Chesterton

La première, c'est la mémoire du pourquoi.
Un agent ne connaît pas l'histoire d'un codebase.
Il ne sait pas que ce `sleep(100)` bizarre a été ajouté après un incident en 2019.
Que cette dépendance figée en `1.4.2` évite un CVE.
Que ce `try/except` apparemment inutile attrape un edge case qui ne s'est manifesté qu'une seule fois, un dimanche à 3h du matin, pendant le Black Friday.

Chesterton avait posé la règle en 1929 :
> si tu tombes sur une barrière au milieu d'un champ sans comprendre pourquoi elle est là, ne la démolis pas,  
> reviens quand tu sauras.


Un agent démolit d'abord et ne saura jamais, sauf si le système lui a mis le *pourquoi* sous les yeux au bon moment.
Un bon environnement d'agents est donc celui qui conservent la meilleure mémoire du *pourquoi* : commentaires qui expliquent les décisions, ADRs versionnés, tickets d'incident reliés au code.  
Sans ce contexte, l'agent devient un stagiaire brillant qui refactore ce qu'il ne comprend pas.

C'est là que tout un pan d'outillage récent prend son sens, sous un nom un peu pompeux, le *context engineering*, qui désigne simplement l'art de décider ce qui entre dans le contexte de l'agent à chaque étape.  
Un outil comme *Context7*, qui injecte la documentation à jour d'une bibliothèque directement dans la session via *MCP* ou *CLI*, c'est une clôture de Chesterton industrialisée, la connaissance du comment-ça-marche-aujourd'hui.  
Les *skills*, ces dossiers d'instructions qu'on charge à la demande, me font penser à la *skill library* de *Voyager* basé sur `GPT-4`, l'agent Minecraft de 2023 qui accumulait ses compétences dans le système et non dans les poids du modèle.  
Attention quand même à ne pas surestimer ces briques : elles nourrissent le modèle en contexte, elles ne le rendent pas plus prudent pour autant.  
Un modèle mieux informé qui reste sûr de lui à tort reste dangereux.

Ce qui amène la seconde chose qui manque, le doute. Un modèle qui répond « je ne sais pas » quand il ne sait pas vaut mieux, en pratique, qu'un modèle qui a raison neuf fois sur dix avec le même aplomb à chaque fois.  
Le premier laisse à l'organisation la possibilité d'aiguiller les cas incertains vers un humain. Le second oblige à tout revérifier, ce qui annule le gain de temps qu'on était venu chercher.

Il existe une profession qui excelle à cet exercice, et ce ne sont pas les informaticiens, ce sont les météorologues.  
Les études de Murphy et Winkler à la fin des années 1970 montrent que lorsqu'un prévisionniste américain annonce 70 % de chances de pluie, il pleut effectivement à peu près sept fois sur dix.  
Cette calibration presque parfaite vient d'une boucle de feedback quotidienne, immédiate, sans échappatoire : chaque prévision est confrontée au ciel le lendemain.  
C'est exactement cette boucle qui manque à la confiance qu'affiche un LLM, entraîné, si l'on en croit des travaux comme ceux de Kadavath et ses collègues en 2022, à débiter la réponse assurée plus qu'à s'abstenir.  
L'incident Replit, vu précédemment, en donne la version grotesque.  
Après avoir effacé la base, l'agent a affirmé avec une assurance totale qu'aucun rollback n'était possible, alors qu'il l'était parfaitement.  
Sans l'obstination de Lemkin à vérifier, cette fausse certitude aurait transformé un incident récupérable en perte définitive.

Router l'incertitude vers un humain, ce n'est donc pas un aveu de faiblesse, c'est une pièce de l'architecture.  
Encore faut-il que l'agent produise un signal d'incertitude fiable, ce qui reste, à ma connaissance, l'un des chantiers les moins avancés du domaine.

## Quand l'agent est retourné contre vous

Tout ce qui précède parle d'un agent qui se trompe tout seul, un accident. Il y a pire, un agent qu'on retourne.  
Simon Willison a résumé le danger sous le nom de *lethal trifecta* : dès qu'un agent cumule un accès à des données sensibles, une exposition à du contenu non fiable et une capacité d'agir vers l'extérieur, il est manipulable.  
Un agent qui lit vos mails, parcourt le web, ou avale un ticket rédigé par n'importe qui peut recevoir ses instructions de ce contenu-là, pas de vous.  
Deux scénarios opposés. Chez Replit, l'agent a désobéi à une consigne. Le *prompt injection*, il obéit trop bien, mais à la mauvaise personne.
Et ça éclaire d'un coup ce qui a réellement lâché chez Replit. Le *code freeze* était écrit dans le prompt, pas dans les permissions.

Une consigne dans le prompt, c'est une politique, quelque chose qu'on demande poliment à l'agent de respecter.  
Une permission refusée au niveau du système, c'est une propriété, quelque chose qu'il ne peut pas violer même s'il le voulait ou si on l'y poussait.  
La distance entre les deux se mesure, dans ce cas précis, en 1 200 comptes effacés.  
Le principe qu'un ingénieur sécurité applique par réflexe, moindre privilège et tout ce qui n'est pas explicitement autorisé est refusé.

À quoi il faut ajouter de quoi reconstituer ce qui s'est passé après coup,  
un journal des actions de l'agent, horodaté et inviolable, sans quoi le post-mortem à la GitLab ou à la AWS devient impossible faute de traces.

Périmètre borné, réversibilité prouvée, contexte fourni, doute routé vers l'humain, permissions verrouillées côté système sont les composants qui permettent de donner de l'autonomie à un agent sans catastrophe.

Les agents IA auront probablement besoin du même principe : non pas leur demander d'être omniscients, mais construire autour d'eux un environnement où leurs erreurs restent contenues.

## Ça porte un nom

Un agent autonome ne devient pas fiable parce qu'on lui donne plus d'intelligence.  
Il devient fiable parce qu'on réduit précisément ce qu'il peut faire.

Les ingénieurs sécurité appliquent ce principe depuis longtemps.  
Un serveur de production critique n'est pas protégé parce qu'on demande gentiment aux développeurs de ne pas casser la base de données.  
Il est protégé parce que les accès sont limités, les actions sont tracées, les changements sont réversibles et les environnements dangereux sont isolés.

L'agent IA devra probablement suivre la même logique.

Un agent chargé de modifier du code ne devrait pas avoir accès directement à la production.  
Il devrait travailler dans un environnement isolé, créer une branche dédiée, exécuter des tests, proposer une modification, puis attendre une validation avant toute action irréversible.

Son autonomie doit donc avoir un périmètre explicite :

- lecture seule sur les systèmes critiques
- écriture limitée à un espace temporaire
- exécution dans un sandbox
- budget en tokens et en temps
- liste blanche d'outils autorisés
- rollback automatique en cas d'anomalie.

Ce principe porte un nom dans le monde des systèmes autonomes : *le harness*, le harnais.

Le terme désigne tout ce qui entoure le modèle pour en faire un agent exploitable : les outils qu'il peut appeler, les permissions qu'on lui accorde, le sandbox où il s'exécute, la mémoire qu'il conserve, les skills disponibles, les hooks qui interceptent ses actions, et les boucles de feedback qui permettent de le surveiller.

Deux équipes qui utilisent exactement le même modèle, mais deux harness différents n'obtiennent pas le même agent.
Elles obtiennent deux niveaux de risque, deux niveaux de contrôle et probablement deux produits différents.

Ce qui me ramène à la question de départ : pour gagner en autonomie, faut-il miser sur le modèle ou sur le système ?

## Concluons

Ma réponse, à la mi-2026, penche nettement du côté du système, pour trois raisons.
- Le modèle fixe le plafond de ce qui est possible, mais le *harness* fixe la part de ce plafond qu'on peut réellement déployer sans se faire mal, et cette part est aujourd'hui bien plus basse que le plafond.
- Ensuite, l'économie : la fiabilité manquante se paie à chaque tentative ratée, à chaque token, indéfiniment, tandis que le *harness* est une dépense d'ingénierie qu'on engage une fois et qu'on amortit.
- Enfin, et c'est ce que le camp de la *bitter lesson* sous-estime, l'irréversibilité et le problème de délégation ne s'évaporent pas avec l'intelligence.

Noam Kolt le montrait en 2024 en traitant les agents comme un problème *principal-agent* classique : on ne résout pas ce genre de problème en recrutant un mandataire plus brillant, on le résout par le *monitoring* et les incitations.
Un agent parfait n'a toujours aucune raison d'avoir le droit d'effacer une base sans validation, pas plus que les ingénieurs les plus compétents d'une équipe n'opèrent sans revue de code ni double validation.
Ils travaillent, eux aussi, sous *harness*.

Je ne prétends pas que ce soit gratuit. Un agent en lecture seule ne répare pas la prod à 3h du matin.
Un *sandbox* étanche tue une partie de la valeur qu'on espérait en donnant les clés à l'agent.  
Maintenir tout cet appareillage coûte du temps d'équipe, en continu.  
Le bon niveau d'autonomie n'est pas une constante, il dépend de ce que vous faites et de ce que vous avez à perdre, et le trouver reste un arbitrage d'ingénieur, pas une doctrine à appliquer les yeux fermés.

Reste que treize ans après Knight Capital, les modèles ont fait des bonds et les *harness* ont à peine bougé.  
La prochaine base de production effacée par un agent le sera pour la même raison que la précédente, parce que rien, dans son environnement, ne l'en empêchait.  
Tant que les systèmes qui accueillent ces agents ne feront pas leur part, on continuera de reprocher aux modèles des fautes qui n'étaient pas les leurs.



# Sources et références

## Événements et données factuelles

### Knight Capital — incident de trading automatisé (1er août 2012)

**SEC, Release No. 34-70694, *In the Matter of Knight Capital Americas LLC*, 16 octobre 2013.**

Rapport officiel de la SEC décrivant :
- le déploiement logiciel défectueux ;
- la réactivation involontaire du code historique « Power Peg » ;
- l'absence de contrôles suffisants ;
- les pertes financières provoquées par l'incident.

Source :
https://www.sec.gov/files/litigation/admin/2013/34-70694.pdf

Source complémentaire :
https://www.sec.gov/newsroom/press-releases/2013-222



--- 

### Incident Replit / SaaStr — suppression d'environnement de production par un agent IA (2025)

Récit public de Jason Lemkin (SaaStr) concernant un incident impliquant un agent IA ayant supprimé des données dans un environnement de production pendant une période de gel de code.   
Amjad Masad (CEO de Replit) a ensuite communiqué sur les mesures correctives mises en place.

Sources :

SaaStr :
https://www.saastr.com/

Replit Blog :
https://blog.replit.com/
 
--- 

### Moffatt v. Air Canada — responsabilité d'un chatbot fournissant une information erronée (2024)

**British Columbia Civil Resolution Tribunal, 2024 BCCRT 149.**

Décision officielle établissant qu'une entreprise peut être tenue responsable des informations fournies par son chatbot.

Source :
https://www.canlii.org/en/bc/bccrt/doc/2024/2024bccrt149/2024bccrt149.html

 
--- 

### GitLab — suppression accidentelle d'une base de données (31 janvier 2017)

**GitLab Engineering, *Postmortem of Database Outage of January 31*.**

Retour d'expérience officiel détaillant :
- la suppression accidentelle d'une base PostgreSQL ;
- l'échec des mécanismes de sauvegarde ;
- les améliorations mises en place après l'incident.

Source :
https://about.gitlab.com/blog/2017/02/10/postmortem-of-database-outage-of-january-31/

 
--- 

### AWS S3 — panne US-East-1 (28 février 2017)

**Amazon Web Services, *Summary of the Amazon S3 Service Disruption in the Northern Virginia (US-EAST-1) Region*.**

Postmortem officiel expliquant l'exécution involontaire d'une commande de maintenance ayant entraîné l'indisponibilité du service.

Source :
https://aws.amazon.com/message/41926/

 
--- 

### Vol Air France 447 — accident Airbus A330 (1er juin 2009)

**Bureau d'Enquêtes et d'Analyses (BEA), Rapport final sur l'accident de l'Airbus A330-203 F-GZCP.**

Rapport officiel analysant notamment :
- les interactions homme-machine ;
- les limites de l'automatisation ;
- les facteurs humains lors de la reprise en manuel.

Source :
https://bea.aero/en/investigation-reports/notified-events/detail/accident-to-the-airbus-a330-203-registered-f-gzcp-operated-by-air-france-on-01-06-2009/

 
--- 

### Uber ATG — accident véhicule autonome de Tempe (18 mars 2018)

**National Transportation Safety Board (NTSB), Highway Accident Report NTSB/HAR-19/03.**

Rapport officiel concernant :
- les limites du système autonome ;
- l'inattention de l'opératrice de sécurité ;
- les défauts du programme d'essais.

Source :
https://www.ntsb.gov/investigations/AccidentReports/Reports/HAR1903.pdf

 
--- 

# Concepts et cadres

## Ironies of Automation

**Bainbridge, L. (1983). *Ironies of Automation*. Automatica, 19(6), 775-779.**

Article fondateur expliquant que l'automatisation peut déplacer les erreurs humaines vers des situations plus rares mais plus complexes à gérer.

Source :
https://doi.org/10.1016/0005-1098(83)90046-8

 
--- 

## Humans and Automation

**Parasuraman, R. & Riley, V. (1997). *Humans and Automation: Use, Misuse, Disuse, Abuse*. Human Factors, 39(2), 230-253.**

Cadre de référence sur les différentes formes d'interaction entre humains et systèmes automatisés.

Source :
https://doi.org/10.1518/001872097778543886

 
--- 

## Amazon — Shareholder Letter 2015

**Jeff Bezos, Amazon Shareholder Letter (2015).**

Document présentant notamment les principes opérationnels d'Amazon autour de la prise de décision, de l'expérimentation et de l'autonomie des équipes.

Source :
https://s2.q4cdn.com/299287126/files/doc_financials/annual/2015-Letter-to-Shareholders.PDF

 
--- 

## Chesterton — The Thing (1929)

**G.K. Chesterton, *The Thing*, chapitre "The Drift from Domesticity".**

Référence historique utilisée pour illustrer le principe de prudence avant de supprimer un mécanisme existant.

Source :
https://www.gutenberg.org/ebooks/470

 
--- 

## SAE J3016 — niveaux d'automatisation automobile

**SAE International, J3016 — *Taxonomy and Definitions for Terms Related to Driving Automation Systems*.**

Standard définissant notamment :
- les niveaux d'autonomie ;
- l'Operational Design Domain (ODD).

Source :
https://www.sae.org/standards/content/j3016_202104/

 
--- 

# Capacité, fiabilité et coût des modèles IA

## The Bitter Lesson

**Sutton, R. (2019). *The Bitter Lesson*.**

Essai expliquant que les avancées majeures en IA proviennent souvent de méthodes exploitant davantage :
- le calcul ;
- les données ;
- les mécanismes d'apprentissage généraux.

Source :
http://www.incompleteideas.net/IncIdeas/BitterLesson.html

 
--- 

## METR — Measuring AI Ability to Complete Long Tasks

**Model Evaluation & Threat Research (METR).**

Travaux mesurant la capacité des agents IA à accomplir des tâches longues et complexes.

Source :
https://metr.org/

 
--- 

## τ-bench — Tool Agent User Interaction Benchmark

**Yao et al. (2024). *τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains*.**

Benchmark évaluant les agents IA utilisant des outils dans des environnements réalistes.

Source :
https://arxiv.org/abs/2406.12045

 
--- 

## AI Agents That Matter

**Kapoor & Narayanan (2024). *AI Agents That Matter*.**

Analyse des méthodes d'évaluation des agents IA selon plusieurs dimensions :
- précision ;
- coût ;
- reproductibilité.

Source :
https://arxiv.org/abs/2407.01502

 
--- 

## TheAgentCompany

**Xu et al. (2024). *TheAgentCompany: Benchmarking LLM Agents on Consequential Real World Tasks*.**

Benchmark évaluant les agents LLM sur des tâches proches du travail réel.

Source :
https://arxiv.org/abs/2412.14161

 
--- 

## SWE-bench

**Jimenez et al. (2023). *SWE-bench: Can Language Models Resolve Real-World GitHub Issues?***

Benchmark mesurant la capacité des modèles à résoudre de vrais problèmes logiciels.

Source :
https://arxiv.org/abs/2310.06770

 
--- 

## Voyager

**Wang et al. (2023). *Voyager: An Open-Ended Embodied Agent with Large Language Models*.**

Travail introduisant notamment le concept de bibliothèque de compétences (*skill library*) pour agents autonomes.

Source :
https://arxiv.org/abs/2305.16291

 
--- 

# LLMflation — baisse des coûts d'inférence

## Epoch AI — Economics of Language Model Inference

Analyse de l'évolution économique des coûts d'inférence des modèles de langage.

Source :
https://epoch.ai/publications/inference-economics-of-language-models

 
--- 

## Artificial Analysis — suivi des performances et coûts LLM

Plateforme de comparaison des modèles IA et de leurs coûts d'utilisation.

Source :
https://artificialanalysis.ai/

 
--- 

## Stanford AI Index 2025

Rapport annuel Stanford analysant :
- les coûts ;
- les performances ;
- les investissements ;
- l'évolution industrielle de l'IA.

Source :
https://hai.stanford.edu/ai-index/2025-ai-index-report

 
--- 

## Andreessen Horowitz — LLM inference economics

Analyse économique de la baisse des coûts d'inférence des LLM.

Source :
https://a16z.com/llmflation-llm-inference-cost/

 
--- 

# Calibration et incertitude

## Murphy & Winkler (1977)

**Murphy, A.H. & Winkler, R.L. (1977). Reliability of Subjective Probability Forecasts of Precipitation and Temperature.**

Travail fondateur sur la calibration probabiliste.

Source :
https://doi.org/10.2307/2345287

 
--- 

## Language Models (Mostly) Know What They Know

**Kadavath et al. (2022).**

Étude sur la capacité des modèles de langage à estimer leur propre niveau d'incertitude.

Source :
https://arxiv.org/abs/2207.05221

 
--- 

## On Calibration of Modern Neural Networks

**Guo et al. (2017).**

Référence majeure sur la calibration des réseaux neuronaux modernes.

Source :
https://arxiv.org/abs/1706.04599

 
--- 

# Sécurité et gouvernance des agents

## The Lethal Trifecta for AI Agents

**Simon Willison (2025).**

Concept décrivant une combinaison dangereuse :
- accès à des données privées ;
- exposition à du contenu non fiable ;
- capacité d'action externe.

Source :
https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/

 
--- 

## Governing AI Agents

**Kolt, N. (2025). *Governing AI Agents*.**

Analyse juridique appliquant notamment la théorie principal-agent aux systèmes autonomes.

Source :
https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4772956

 
--- 

## Visibility into AI Agents

**Chan et al. (2024).**

Travaux sur :
- l'observabilité des agents ;
- les journaux d'action ;
- l'auditabilité.

Source :
https://arxiv.org/

 
--- 

## OWASP Top 10 for Large Language Model Applications

Référence sécurité couvrant notamment :
- Prompt Injection ;
- Data Leakage ;
- Excessive Agency ;
- Insecure Plugin Design.

Source :
https://owasp.org/www-project-top-10-for-large-language-model-applications/ 
 