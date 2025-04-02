import fs from 'fs';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const IMAGE_PATH = path.join(__dirname, 'public', 'Map.png');
const OUTPUT_DIR = path.join(__dirname, 'public', 'tiles');
const TILE_SIZE = 256; // Taille standard des tuiles
const MAX_ZOOM = 4;    // Niveau de zoom maximum (changé de 5 à 4)

// Fonction pour créer un répertoire s'il n'existe pas
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Fonction principale pour générer les tuiles
async function generateTiles() {
  try {
    console.log(`Génération des tuiles à partir de ${IMAGE_PATH}...`);
    
    // Vérifier si le fichier source existe
    if (!fs.existsSync(IMAGE_PATH)) {
      throw new Error(`Le fichier source ${IMAGE_PATH} n'existe pas.`);
    }
    
    // Obtenir les informations sur l'image
    const metadata = await sharp(IMAGE_PATH).metadata();
    console.log(`Dimensions de l'image: ${metadata.width}x${metadata.height}`);
    
    // Créer le dossier de sortie principal
    ensureDirectoryExists(OUTPUT_DIR);
    
    // Générer les tuiles pour chaque niveau de zoom
    for (let z = 0; z <= MAX_ZOOM; z++) {
      console.log(`Génération des tuiles pour le niveau de zoom ${z}...`);
      
      // Calculer les dimensions de l'image à ce niveau de zoom
      const scaleFactor = 1 / Math.pow(2, MAX_ZOOM - z);
      const zoomWidth = Math.floor(metadata.width * scaleFactor);
      const zoomHeight = Math.floor(metadata.height * scaleFactor);
      
      // Calculer le nombre de tuiles nécessaires
      const tilesX = Math.ceil(zoomWidth / TILE_SIZE);
      const tilesY = Math.ceil(zoomHeight / TILE_SIZE);
      
      console.log(`Dimensions à ce niveau: ${zoomWidth}x${zoomHeight}, Tuiles: ${tilesX}x${tilesY}`);
      
      // Créer le dossier pour ce niveau de zoom
      const zoomDir = path.join(OUTPUT_DIR, z.toString());
      ensureDirectoryExists(zoomDir);
      
      // Si l'image est très grande, il est plus efficace de la redimensionner une fois
      // puis de découper la version redimensionnée
      const resizedImagePath = path.join(OUTPUT_DIR, `temp_z${z}.png`);
      
      try {
        // Redimensionner l'image pour ce niveau de zoom
        if (z < MAX_ZOOM) { // Seulement redimensionner pour les niveaux de zoom inférieurs
          await sharp(IMAGE_PATH)
            .resize(zoomWidth, zoomHeight)
            .toFile(resizedImagePath);
        }
        
        // Utiliser l'image originale pour le niveau de zoom maximum
        const sourceImage = z < MAX_ZOOM ? resizedImagePath : IMAGE_PATH;
        
        // Découper en tuiles
        for (let x = 0; x < tilesX; x++) {
          // Créer le dossier pour cette colonne
          const colDir = path.join(zoomDir, x.toString());
          ensureDirectoryExists(colDir);
          
          for (let y = 0; y < tilesY; y++) {
            // Calculer la position de découpe
            const extractOptions = {
              left: x * TILE_SIZE,
              top: y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE
            };
            
            // Éviter les dépassements aux bords
            if (extractOptions.left + TILE_SIZE > zoomWidth) {
              extractOptions.width = zoomWidth - extractOptions.left;
            }
            if (extractOptions.top + TILE_SIZE > zoomHeight) {
              extractOptions.height = zoomHeight - extractOptions.top;
            }
            
            // Chemin de sortie pour cette tuile
            const tileOutput = path.join(colDir, `${y}.png`);
            
            // Découper et sauvegarder la tuile
            await sharp(sourceImage)
              .extract(extractOptions)
              .toFile(tileOutput);
          }
        }
        
        // Supprimer le fichier temporaire après utilisation
        if (z < MAX_ZOOM && fs.existsSync(resizedImagePath)) {
          fs.unlinkSync(resizedImagePath);
        }
      } catch (error) {
        console.error(`Erreur lors de la génération des tuiles pour le zoom ${z}:`, error);
        // Continuer avec les autres niveaux de zoom
      }
    }
    
    console.log('Génération des tuiles terminée!');
    console.log(`Les tuiles sont disponibles dans: ${OUTPUT_DIR}`);
    console.log('Pour utiliser ces tuiles dans Leaflet, configurez le chemin comme suit:');
    console.log("L.tileLayer('/tiles/{z}/{x}/{y}.png', { minZoom: 0, maxZoom: " + MAX_ZOOM + " })");
    
  } catch (error) {
    console.error('Erreur lors de la génération des tuiles:', error);
  }
}

// Lancer la génération
generateTiles(); 