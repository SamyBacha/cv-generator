# Proxym France — CV Generator

Éditeur de CV statique, sans installation. Fonctionne directement dans le navigateur.

---

## Accès

Ouvrir `index.html` dans un navigateur, ou accéder à l'URL GitLab Pages du projet.

Pour démarrer avec un CV vierge (lorem ipsum) : ajouter `?blank` à l'URL.

---

## Les deux modes

### Visualisation (mode par défaut)

Le CV s'affiche tel qu'il sera imprimé. Tous les champs de texte sont **éditables directement** : cliquer sur n'importe quel texte (nom, titre, dates, descriptions…) pour le modifier en place.

Une mini-barre d'outils (gras, italique, souligné) apparaît au-dessus du champ actif.

### Édition

Cliquer sur **✏ Édition** dans la barre du haut pour ouvrir le panneau formulaire. Il permet de :

- Modifier les informations personnelles (nom, rôle)
- Gérer les sections structurées (À propos, Compétences, Timeline, Formation, Enseignement, Langues, Hobbies, Missions)
- Ajouter ou supprimer des entrées dans chaque section avec les boutons **+** et **−**

Cliquer sur **Visualisation** pour repasser en mode affichage et voir le résultat.

---

## Gérer les sections

Le bouton **Sections ▾** dans la barre du haut ouvre un menu permettant d'afficher ou masquer chaque section du CV (utile pour adapter le CV à une offre sans supprimer les données).

Les boutons ⊙ / ⊘ visibles à côté de chaque titre de section ont le même effet directement depuis la visualisation ou l'éditeur.

---

## Logos des missions (page 2)

Dans la visualisation, cliquer sur la zone ⊕ à gauche du nom du client pour ouvrir le popover logo :

- **Image** : importer un fichier image (redimensionnée automatiquement)
- **SVG** : coller le code SVG directement
- **✕** : supprimer le logo

---

## Sauvegarder et exporter

| Action | Bouton |
|---|---|
| Sauvegarder dans le navigateur | **💾 Sauvegarder** — persiste dans le localStorage |
| Exporter le CV en JSON | **↓ Exporter JSON** — télécharge `cv-data.json` |
| Importer un JSON existant | **↑ Importer JSON** — charge un fichier exporté précédemment |
| Repartir de zéro | **+ Nouveau CV vierge** — ou ouvrir l'URL avec `?blank` |

> La sauvegarde localStorage est propre au navigateur et au domaine. Utiliser **Exporter JSON** pour conserver une copie portable.

---

## Imprimer / Exporter en PDF

Cliquer sur le bouton **🖨 Imprimer / PDF** en bas à droite, ou `Ctrl+P` / `Cmd+P`.

Dans la boîte de dialogue d'impression du navigateur :
- Cocher **"Graphiques d'arrière-plan"** pour que les couleurs et le dégradé jaune apparaissent
- Choisir **Format A4**, marges **Aucune**
- Sélectionner **"Enregistrer en PDF"** comme imprimante pour obtenir le fichier

---

## Déploiement

Pousser sur la branche `develop` — GitLab CI publie automatiquement le dossier `public/` en GitLab Pages.
