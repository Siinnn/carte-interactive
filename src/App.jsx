import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

function App() {
  const mapRef = useRef(null);
  const [tilesGenerated, setTilesGenerated] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('vérification');

  useEffect(() => {
    if (mapRef.current) {
      const map = L.map(mapRef.current, {
        crs: L.CRS.Simple,
        minZoom: 0,
        maxZoom: 4,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 120,
        attributionControl: false,
        zoomControl: false,
        background: 'transparent'
      });
      
      mapRef.current.style.background = 'transparent';
      mapRef.current.style.border = 'none';
      mapRef.current.style.outline = 'none';
      
      const w = 31354;
      const h = 24066;
      const southWest = map.unproject([0, h], 4);
      const northEast = map.unproject([w, 0], 4);
      const bounds = new L.LatLngBounds(southWest, northEast);
      
      fetch('/tiles/0/0/0.png')
        .then(response => {
          if (response.ok) {
            setTilesGenerated(true);
            setLoadingStatus('ok');
            
            const tileLayer = L.tileLayer('/tiles/{z}/{x}/{y}.png', {
              minZoom: 0,
              maxZoom: 4,
              noWrap: true,
              tileSize: 256,
              bounds: bounds,
              attribution: 'Image locale'
            }).addTo(map);
            
            map.setMaxBounds(bounds);
            map.fitBounds(bounds);
            
            tileLayer.on('load', function() {
              console.log("Tuiles chargées avec succès");
            });
          } else {
            setLoadingStatus('non_disponible');
            throw new Error('Les tuiles ne sont pas disponibles');
          }
        })
        .catch(error => {
          console.log('Erreur de chargement des tuiles:', error);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          map.setView([48.8566, 2.3522], 5);
          
          L.marker([48.8566, 2.3522]).addTo(map)
            .bindPopup('Les tuiles ne sont pas disponibles. Vérifiez que le dossier public/tiles contient les tuiles générées.')
            .openPopup();
        });

      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);
      
      // Ajouter un bouton plein écran simple
      const fullScreenControl = L.Control.extend({
        options: {
          position: 'bottomright'
        },
        
        onAdd: function() {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
          const button = L.DomUtil.create('a', 'fullscreen-button', container);
          button.innerHTML = '⛶';
          button.href = '#';
          button.title = 'Plein écran';
          button.style.width = '30px';
          button.style.height = '30px';
          button.style.lineHeight = '30px';
          button.style.fontSize = '20px';
          button.style.textAlign = 'center';
          button.style.fontWeight = 'bold';
          button.style.textDecoration = 'none';
          button.style.backgroundColor = 'white';
          button.style.color = '#333';
          button.style.display = 'block';
          
          L.DomEvent
            .addListener(button, 'click', L.DomEvent.stopPropagation)
            .addListener(button, 'click', L.DomEvent.preventDefault)
            .addListener(button, 'click', function() {
              const mapContainer = mapRef.current;
              
              if (!document.fullscreenElement) {
                if (mapContainer.requestFullscreen) {
                  mapContainer.requestFullscreen();
                } else if (mapContainer.mozRequestFullScreen) {
                  mapContainer.mozRequestFullScreen();
                } else if (mapContainer.webkitRequestFullscreen) {
                  mapContainer.webkitRequestFullscreen();
                } else if (mapContainer.msRequestFullscreen) {
                  mapContainer.msRequestFullscreen();
                }
              } else {
                if (document.exitFullscreen) {
                  document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                  document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                  document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                  document.msExitFullscreen();
                }
              }
            });
            
          return container;
        }
      });
      
      map.addControl(new fullScreenControl());
      
      // Gérer le redimensionnement de la carte en mode plein écran
      const handleFullscreenChange = () => {
        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      };
      
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);

      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        map.remove();
      };
    }
  }, []);

  return (
    <div className="app-container">
      <header>
        <h1>Carte Interactive de Mutsamudu</h1>
        <p>Exploration détaillée de la capitale de l'île d'Anjouan (Comores)</p>
      </header>
      <main>
        <div id="map" ref={mapRef} style={{ width: '100%', height: '600px', background: 'transparent', border: 'none' }}></div>
        
        {loadingStatus === 'non_disponible' && (
          <div className="info-message" style={{ padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '4px', margin: '15px 0' }}>
            <h3>Tuiles non trouvées</h3>
            <p>Les tuiles nécessaires à l'affichage de la carte n'ont pas été trouvées.</p>
            <p>Vérifiez que le dossier <code>public/tiles</code> contient bien les tuiles générées (dossiers 0 à 4).</p>
          </div>
        )}
        
        {tilesGenerated && (
          <div className="success-message" style={{ padding: '15px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', margin: '15px 0' }}>
            <h3>Carte chargée avec succès</h3>
            <p>Découvrez Mutsamudu en explorant cette carte interactive avec 5 niveaux de zoom (0-4).</p>
            <p>Utilisez la molette de la souris ou les boutons +/- pour zoomer, cliquez-glissez pour vous déplacer, et cliquez sur ⛶ pour passer en plein écran.</p>
          </div>
        )}
        
        <div className="info-panel">
          <h2>À propos de Mutsamudu</h2>
          <p>Mutsamudu est la capitale de l'île d'Anjouan, une des îles de l'archipel des Comores situé dans l'océan Indien, entre Madagascar et la côte est-africaine.</p>
          <p>Fondée au XIVe siècle, Mutsamudu est une ville historique qui présente une architecture unique, mélangeant les influences arabes, africaines et européennes. Elle est célèbre pour sa médina entourée de fortifications datant du XVIIe siècle et son port qui a été un important centre commercial.</p>
          <p>La ville est caractérisée par ses ruelles étroites, ses anciennes maisons en pierre de corail, ses mosquées historiques et son cadre naturel exceptionnel, entre montagne et océan.</p>
          
          <h3>Informations techniques</h3>
          <p>Cette application affiche une carte détaillée de Mutsamudu à partir d'un fichier TIFF découpé en tuiles.</p>
          <p>Le découpage en tuiles permet d'afficher cette image volumineuse de manière efficace, en ne chargeant que les parties visibles à l'écran.</p>
          <p>Les tuiles ont été générées pour 5 niveaux de zoom (0 à 4), ce qui permet d'explorer la ville avec différents niveaux de détail.</p>
        </div>
      </main>
      <footer>
        <p>© 2025 Carte Interactive de Mutsamudu - Créé avec React et Leaflet</p>
      </footer>
    </div>
  );
}

export default App;
