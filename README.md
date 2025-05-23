# Carte Interactive

Une application web React qui permet d'afficher une carte interactive basée sur une image TIFF.

## Description

Cette application est une démonstration d'une carte interactive utilisant la bibliothèque Leaflet. Dans une version complète, elle permettrait d'afficher une image TIFF géoréférencée sous forme de carte interactive avec zoom, déplacement et autres fonctionnalités.

## Fonctionnalités

- Affichage d'une carte interactive avec Leaflet
- Navigation fluide avec déplacement et zoom
- Interface responsive adaptée aux appareils mobiles
- Panneau d'information expliquant l'approche de transformation d'une image TIFF en carte interactive

## Installation

1. Clonez ce dépôt
2. Installez les dépendances :

```bash
npm install
```

3. Lancez l'application en mode développement :

```bash
npm run dev
```

## Processus complet (non implémenté dans cette démonstration)

Pour transformer une image TIFF en carte interactive complète, les étapes suivantes seraient nécessaires :

1. **Conversion en Cloud Optimized GeoTIFF (COG)** :
   ```bash
   gdal_translate input.tif output_cog.tif -of COG \
     -co COMPRESS=JPEG \
     -co QUALITY=85 \
     -co OVERVIEWS=YES \
     -co OVERVIEW_RESAMPLING=BILINEAR
   ```

2. **Découpage en tuiles** :
   ```bash
   gdal2tiles.py --zoom=0-10 --processes=4 output_cog.tif tiles/
   ```

3. **Intégration des tuiles générées dans l'application web** avec le code :
   ```javascript
   L.tileLayer('tiles/{z}/{x}/{y}.png', {
     maxZoom: 18,
     attribution: '© Your Map Data'
   }).addTo(map);
   ```

## Technologies utilisées

- React
- Vite
- Leaflet
- CSS Grid & Flexbox

## Optimisations possibles

- Mise en place d'un cache HTTP
- Lazy loading des tuiles
- Compression des images
- Mise en place d'un serveur de tuiles dédié

## Licence

MIT
#   c a r t e - i n t e r a c t i v e  
 