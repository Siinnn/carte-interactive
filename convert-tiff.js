import fs from 'fs';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire actuel en modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertTiffToPng() {
  try {
    console.log('Lecture du fichier TIFF...');
    
    // Chemin vers le fichier TIFF
    const tiffPath = path.join(__dirname, 'public', 'Map.tif');
    
    // Chemin de sortie pour le fichier PNG
    const pngPath = path.join(__dirname, 'public', 'Map.png');
    
    // Vérifier si le fichier TIFF existe
    if (!fs.existsSync(tiffPath)) {
      console.error(`Le fichier ${tiffPath} n'existe pas.`);
      return;
    }
    
    console.log('Conversion en cours...');
    
    await sharp(tiffPath)
      .toFormat('png')
      .toFile(pngPath);
    
    console.log(`Conversion réussie! Fichier PNG sauvegardé à ${pngPath}`);
  } catch (error) {
    console.error('Erreur lors de la conversion:', error);
  }
}

convertTiffToPng(); 