// Utilisation de la syntaxe CommonJS
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

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

// Fonction pour exécuter une commande ImageMagick
function runImageMagickCommand(args) {
  try {
    // Pour Windows, la commande est 'magick'
    execSync(`magick ${args}`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'exécution de la commande ImageMagick:`, error);
    return false;
  }
}

// Fonction principale
async function generateTiles() {
  try {
    console.log(`Génération des tuiles à partir de ${IMAGE_PATH}...`);
    
    // Vérifier si le fichier source existe
    if (!fs.existsSync(IMAGE_PATH)) {
      throw new Error(`Le fichier source ${IMAGE_PATH} n'existe pas.`);
    }
    
    // Créer le dossier de sortie principal s'il n'existe pas
    ensureDirectoryExists(OUTPUT_DIR);
    
    // Obtenir les dimensions de l'image
    console.log('Récupération des dimensions de l\'image...');
    try {
      const identifyOutput = execSync(`magick identify -format "%wx%h" "${IMAGE_PATH}"`).toString().trim();
      const [width, height] = identifyOutput.split('x').map(Number);
      console.log(`Dimensions de l'image: ${width}x${height}`);
      
      // Générer les tuiles pour chaque niveau de zoom
      for (let z = 0; z <= MAX_ZOOM; z++) {
        console.log(`\nGénération des tuiles pour le niveau de zoom ${z}...`);
        
        // Calculer les dimensions de l'image à ce niveau de zoom
        const scaleFactor = 1 / Math.pow(2, MAX_ZOOM - z);
        const zoomWidth = Math.floor(width * scaleFactor);
        const zoomHeight = Math.floor(height * scaleFactor);
        
        // Calculer le nombre de tuiles nécessaires
        const tilesX = Math.ceil(zoomWidth / TILE_SIZE);
        const tilesY = Math.ceil(zoomHeight / TILE_SIZE);
        
        console.log(`Dimensions à ce niveau: ${zoomWidth}x${zoomHeight}, Tuiles: ${tilesX}x${tilesY}`);
        
        // Créer le dossier pour ce niveau de zoom
        const zoomDir = path.join(OUTPUT_DIR, z.toString());
        ensureDirectoryExists(zoomDir);
        
        // Créer une version redimensionnée temporaire pour ce niveau de zoom
        const resizedImagePath = path.join(OUTPUT_DIR, `temp_z${z}.png`);
        
        console.log(`Redimensionnement de l'image pour le niveau de zoom ${z}...`);
        const resizeSuccess = runImageMagickCommand(`convert "${IMAGE_PATH}" -resize ${zoomWidth}x${zoomHeight} "${resizedImagePath}"`);
        
        if (!resizeSuccess) {
          console.log(`Échec du redimensionnement pour le niveau de zoom ${z}, passage au niveau suivant.`);
          continue;
        }
        
        // Découper l'image redimensionnée en tuiles
        console.log(`Découpage en tuiles pour le niveau de zoom ${z}...`);
        
        // Pour chaque ligne et colonne de tuiles
        for (let x = 0; x < tilesX; x++) {
          // Créer le dossier pour cette colonne
          const colDir = path.join(zoomDir, x.toString());
          ensureDirectoryExists(colDir);
          
          for (let y = 0; y < tilesY; y++) {
            // Calculer la position de découpe
            const cropX = x * TILE_SIZE;
            const cropY = y * TILE_SIZE;
            const cropWidth = Math.min(TILE_SIZE, zoomWidth - cropX);
            const cropHeight = Math.min(TILE_SIZE, zoomHeight - cropY);
            
            // Chemin de sortie pour cette tuile
            const tileOutput = path.join(colDir, `${y}.png`);
            
            // Découper et sauvegarder la tuile
            runImageMagickCommand(`convert "${resizedImagePath}" -crop ${cropWidth}x${cropHeight}+${cropX}+${cropY} "${tileOutput}"`);
          }
          
          console.log(`  Progression: ${Math.round((x + 1) / tilesX * 100)}% (${x + 1}/${tilesX} colonnes)`);
        }
        
        // Supprimer le fichier temporaire
        if (fs.existsSync(resizedImagePath)) {
          fs.unlinkSync(resizedImagePath);
          console.log(`Fichier temporaire supprimé: ${resizedImagePath}`);
        }
      }
      
      console.log('\nGénération des tuiles terminée!');
      console.log(`Les tuiles sont disponibles dans: ${OUTPUT_DIR}`);
      console.log('Pour utiliser ces tuiles dans Leaflet, configurez le chemin comme suit:');
      console.log(`L.tileLayer('/tiles/{z}/{x}/{y}.png', { minZoom: 0, maxZoom: ${MAX_ZOOM} })`);
      
    } catch (error) {
      console.error('Erreur lors de l\'identification de l\'image:', error);
      console.error('Veuillez vous assurer qu\'ImageMagick est installé et accessible depuis la ligne de commande.');
      console.error('Téléchargez-le depuis: https://imagemagick.org/script/download.php');
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Lancer la génération des tuiles
generateTiles(); 