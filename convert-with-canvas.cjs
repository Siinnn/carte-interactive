// Utilisation de la syntaxe CommonJS
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Chemin vers le fichier TIFF
const tiffPath = path.join(__dirname, 'public', 'Map.tif');

// Chemin de sortie pour le fichier PNG
const pngPath = path.join(__dirname, 'public', 'Map.png');

// Vérifier si le fichier TIFF existe
if (!fs.existsSync(tiffPath)) {
  console.error(`Le fichier ${tiffPath} n'existe pas.`);
  process.exit(1);
}

console.log('Conversion de TIFF en PNG en utilisant ImageMagick...');

// On utilise ImageMagick qui est un outil en ligne de commande souvent disponible
// Si vous n'avez pas ImageMagick, vous devrez l'installer :
// Windows: https://imagemagick.org/script/download.php#windows
// Ou essayer avec d'autres outils comme GIMP en ligne de commande

// Commande pour Windows (magick) - pour les utilisateurs Linux/Mac, utilisez "convert" au lieu de "magick"
const convertProcess = spawn('magick', [
  'convert',
  tiffPath,
  pngPath
]);

convertProcess.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

convertProcess.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

convertProcess.on('close', (code) => {
  if (code === 0) {
    console.log(`Conversion réussie! Fichier PNG sauvegardé à ${pngPath}`);
  } else {
    console.error(`La commande a échoué avec le code: ${code}`);
    console.log('Veuillez installer ImageMagick ou convertir le fichier manuellement.');
    console.log('https://imagemagick.org/script/download.php#windows');
  }
}); 